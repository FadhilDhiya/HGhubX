import { useEffect, useState, type ReactNode } from "react";
import { api, APP_VERSION, hostOf, logLine, platform } from "../api";
import type { UpdateInfo } from "../types";
import { APP_NAME } from "../branding";
import { useStore } from "../store";
import { Modal, Toggle } from "../components/ui";
import GateDialog from "../components/GateDialog";
import { copyPlaybackLog, initPlaybackLog, setPlaybackLog, tracePlayback, usePlaybackLog } from "../player/diagnostics";
import { formatNetDiag, shortVerdict } from "../netDiagReport";
import { copyText } from "../clipboard";
import { IBack, IBoltF, IBroom, IChevR, IHeart, IInfo, ILink, ILockF, IMoon, IRefresh, ISettings, ISun, IVolMute, IList, Logo } from "../icons";

/* 独立Settings页：Server Address / Appearance / Playback / Local Data / Clear cache / Network Diagnostics / 关于
   入口：Windows 侧栏「Settings」、Android「我的」右上角齿轮 */
export default function Settings({ onBack, wide }: { onBack: () => void; wide: boolean }) {
  const { theme, setTheme, favs, history, muteOnStartup, setMuteOnStartup, swipeEp, setSwipeEp, preferHevc, setPreferHevc, strictSecurity, strictSecurityReady, securityPending, cliRelaxed, setStrictSecurity, toast, gate } = useStore();
  const [about, setAbout] = useState(false);
  const [clearOpen, setClearOpen] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [lineOpen, setLineOpen] = useState(false);
  const [lineBase, setLineBase] = useState("");
  const [checking, setChecking] = useState(false);
  const [update, setUpdate] = useState<UpdateInfo | null>(null);
  /** 应用内更新进行到哪一步（空串=没在更新） */
  const [updating, setUpdating] = useState("");
  const playbackLog = usePlaybackLog();
  const [copyingLog, setCopyingLog] = useState(false);
  const [diagnosing, setDiagnosing] = useState(false);
  const [diagReport, setDiagReport] = useState<string | null>(null);
  const [copyingReport, setCopyingReport] = useState(false);

  useEffect(() => { setLineBase(gate.base); }, [gate.base]);
  useEffect(() => { void initPlaybackLog(); }, []);

  const checkUpdate = async () => {
    setChecking(true);
    try {
      const info = await api.checkUpdate();
      if (info.has_update) setUpdate(info);
      else toast(`Already up to date v${info.current}`, "ok");
    } catch (e) {
      toast((e as Error).message || "Update check failed", "info");
    } finally {
      setChecking(false);
    }
  };
  /** 更新：用系统浏览器打开下载页，由系统/浏览器完成下载与安装。
   *
   * 不再自己下载 APK 并调安装器 —— 那条路在安卓上要额外过 FileProvider
   * 与「安装未知应用」授权，失败点多，体验并不比浏览器好。
   */
  const doUpdate = async () => {
    if (!update) return;
    setUpdating("Opening…");
    try {
      await api.openUrl(update.url);
    } catch (e) {
      await copyText(update.url)
        .then(() => toast("Download link copied; paste it into a browser", "ok"))
        .catch(() => toast((e as Error).message || "打开失败", "info"));
    } finally {
      setUpdating("");
    }
  };

  const Section = ({ title, children }: { title: string; children: ReactNode }) => (
    <>
      <div className="text-[10.5px] font-semibold text-dim tracking-wide px-1 mt-4 mb-1.5">{title}</div>
      <div className="rounded-(--r-md) bg-s2 divide-y divide-s3">{children}</div>
    </>
  );

  return (
    <div className="absolute inset-0 bg-bg flex flex-col">
      <div className="shrink-0 relative overflow-hidden bg-s1" style={{ paddingTop: "var(--sat, 0px)" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(90% 120% at 100% 0%, var(--p-pc) 0%, transparent 60%)", opacity: 0.32 }} />
        <div className="relative px-3 pt-2 pb-4">
          <button onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-full flex items-center justify-center text-on hover:bg-s3 pressable"><IBack size={20} /></button>
          <div className="px-2 mt-1 flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-9 h-9 rounded-(--r-sm) bg-pc text-on-pc flex items-center justify-center"><ISettings size={20} strokeWidth={1.7} /></span>
                <span className="text-[24px] font-bold tracking-wide text-on">Settings</span>
              </div>
              <div className="text-[11px] text-mut mt-1">Appearance · Playback · Local data · Diagnostics</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 scroll-y px-4 pt-1 pb-10">
        <div className={wide ? "max-w-[720px] mx-auto" : ""}>
          <Section title="Appearance">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary">{theme === "dark" ? <IMoon size={16} /> : <ISun size={16} />}</span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Dark Appearance</div>
                <div className="text-[10.5px] text-mut">Fluent-inspired dark appearance</div>
              </div>
              <Toggle on={theme === "dark"} onChange={(on) => setTheme(on ? "dark" : "light")} label="Dark Appearance" />
            </div>
          </Section>

          <Section title="Playback">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IVolMute size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Mute on startup</div>
                <div className="text-[10.5px] text-mut">Enabled by default. Each launch starts muted; if disabled, the last mute state is remembered. Takes effect on next launch.</div>
              </div>
              <Toggle on={muteOnStartup} onChange={setMuteOnStartup} label="Mute on startup" />
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IList size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Swipe between episodes</div>
                <div className="text-[10.5px] text-mut">Swipe up or down to switch episodes; move to the next series at the end.</div>
              </div>
              <Toggle on={swipeEp} onChange={setSwipeEp} label="Swipe between episodes" />
            </div>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IBoltF size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Prefer HD quality</div>
                <div className="text-[10.5px] text-mut">Prefer HEVC when available; fall back to standard quality if playback fails.</div>
              </div>
              <Toggle on={preferHevc} onChange={setPreferHevc} label="Prefer HD quality" />
            </div>
          </Section>

          <Section title="Local Data">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IHeart size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Local favorites</div>
                <div className="text-[10.5px] text-mut">{favs.length}  favorites · {history.length}  history entries</div>
              </div>
            </div>
            <button onClick={() => setClearOpen(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IBroom size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Clear cache</div>
                <div className="text-[10.5px] text-mut">Cover / playback cache and local records</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Network">
            <button onClick={() => setLineOpen(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IBoltF size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Server Address</div>
                <div className="text-[10.5px] text-mut truncate">{lineBase ? hostOf(lineBase) : "Not configured"}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILockF size={15} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Strict Security Mode</div>
                <div className="text-[10.5px] text-mut">
                  {cliRelaxed
                    ? "Compatibility mode enabled using --no-strict. You can re-enable strict security."
                    : "On by default to guard against unsafe content and local-network probing. Disable only if a trusted proxy requires compatibility mode."}
                </div>
              </div>
              <Toggle
                on={strictSecurity}
                disabled={!strictSecurityReady || securityPending}
                onChange={(on) => {
                  void setStrictSecurity(on).then(() => {
                    toast(on ? "Strict security enabled" : "Switched to compatibility mode (reduced filtering and safeguards).", "info");
                  }).catch(() => toast("Unable to save security setting; previous mode retained", "info"));
                }}
                label="Strict Security Mode"
              />
            </div>
            {/* 打不开时先点这里：把 DNS / 代理 / HTTP 结果Copy给维护者 */}
            <button disabled={diagnosing} onClick={async () => {
              setDiagnosing(true);
              try {
                const diag = await api.netDiag();
                // 落盘走原始 JSON（便于脚本统计），Copy给对方的是分段可读报告。
                logLine(`[net_diag] ${JSON.stringify(diag)}`);
                const http = (diag.http ?? {}) as { ms?: number; status?: number };
                const dns = (diag.dns ?? {}) as { count?: number; has_fake_ip?: boolean };
                const env = (diag.env ?? {}) as Record<string, unknown>;
                tracePlayback("net.diag", {
                  verdict: String(diag.verdict ?? ""),
                  host: hostOf(String(diag.host ?? "")), http_status: http.status ?? null, http_ms: http.ms ?? null,
                  dns_count: dns.count ?? null, fake_ip: dns.has_fake_ip ?? null,
                  proxy: Object.values(env).some(Boolean), strict: strictSecurity,
                });
                const report = formatNetDiag(diag);
                try {
                  await copyText(report);
                  toast(`DiagnosticsCopied · ${shortVerdict(diag)}`, "ok");
                } catch {
                  setDiagReport(report);
                  toast("Diagnostics finished; copy failed. Try again in the report.", "info");
                }
              } catch (e) {
                const detail = e instanceof Error ? e.message : typeof e === "string" ? e : "Please try again later";
                toast(`Network diagnostics failed：${detail}`, "info");
              } finally {
                setDiagnosing(false);
              }
            }} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable disabled:opacity-60">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILink size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">{diagnosing ? "Diagnosing…" : "Network Diagnostics"}</div>
                <div className="text-[10.5px] text-mut">Check DNS, TCP, proxy and connectivity, then copy the diagnostic report.</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Playback Diagnostics">
            <div className="flex items-center gap-3 px-3.5 py-3">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IInfo size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">Playback diagnostic logging</div>
                <div className="text-[10.5px] text-mut">Version, platform, server and playback errors are always logged. The toggle also logs seeking and buffering.</div>
                {playbackLog.error && <div role="alert" className="text-[10.5px] text-danger">{playbackLog.error}</div>}
              </div>
              <Toggle label="Playback diagnostic logging" on={playbackLog.enabled} disabled={!playbackLog.ready || playbackLog.pending}
                onChange={(on) => { void setPlaybackLog(on).then(() => toast(on ? "Playback diagnostics enabled; reproduce the issue" : "Playback diagnostics disabled; existing logs retained", "ok")).catch(() => toast("日志SettingsUnable to save，请Retry", "info")); }} />
            </div>
            <button disabled={!playbackLog.ready || playbackLog.pending || copyingLog} onClick={async () => {
              setCopyingLog(true);
              try { await copyPlaybackLog(); toast("Playback diagnostic log copied", "ok"); }
              catch (e) { toast((e as Error).message || "Copy日志失败", "info"); }
              finally { setCopyingLog(false); }
            }} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable disabled:opacity-60">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><ILink size={16} /></span>
              <div className="flex-1 min-w-0">
                <div className="text-[12.5px] text-on">{copyingLog ? "Copying…" : "Copy Playback Log"}</div>
                <div className="text-[10.5px] text-mut break-all">Includes version, platform, server and playback errors; paste to share the full log.{playbackLog.path ? ` · ${playbackLog.path}` : ""}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <Section title="Other">
            <button onClick={checkUpdate} disabled={checking} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable disabled:opacity-60">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IRefresh size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">Check for updates</div>
                <div className="text-[10.5px] text-mut">{checking ? "Checking…" : `Current v${APP_VERSION} · Compare with GitHub Releases`}</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
            <button onClick={() => setAbout(true)} className="w-full flex items-center gap-3 px-3.5 py-3 text-left pressable">
              <span className="w-8 h-8 rounded-full bg-s3 flex items-center justify-center text-primary"><IInfo size={16} /></span>
              <div className="flex-1">
                <div className="text-[12.5px] text-on">About {APP_NAME}</div>
                <div className="text-[10.5px] text-mut">Version {APP_VERSION} · Noncommercial use only</div>
              </div>
              <IChevR size={15} className="text-mut" />
            </button>
          </Section>

          <div className="text-center text-[10px] text-dim mt-5">{APP_NAME} {APP_VERSION} · {platform === "android" ? "Android" : platform === "ios" ? "iOS" : platform === "macos" ? "macOS" : platform === "linux" ? "Linux" : "Windows"} client</div>
        </div>
      </div>

      <GateDialog open={lineOpen} onClose={() => setLineOpen(false)} />

      <Modal open={diagReport !== null} onClose={() => setDiagReport(null)} width={520}>
        <div className="p-5">
          <h2 className="text-[14.5px] font-bold text-on">Network Diagnostic Report</h2>
          <p className="text-[12px] text-mut mt-2">Diagnostics completed but auto-copy failed. Retry or select and copy the report below.</p>
          <textarea readOnly aria-label="Network Diagnostic Report" value={diagReport ?? ""}
            className="w-full h-64 mt-3 p-3 rounded-(--r-sm) bg-s3 text-[11px] text-on resize-none" />
          <div className="flex gap-2 mt-4">
            <button onClick={() => setDiagReport(null)} className="flex-1 h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on pressable">Close</button>
            <button disabled={copyingReport} onClick={async () => {
              if (diagReport === null) return;
              setCopyingReport(true);
              try { await copyText(diagReport); toast("Network Diagnostic ReportCopied", "ok"); setDiagReport(null); }
              catch { toast("Copy failed. Select and copy the report text manually.", "info"); }
              finally { setCopyingReport(false); }
            }} className="flex-1 h-9 rounded-(--r-ctl) brand-grad text-[12.5px] pressable disabled:opacity-60">{copyingReport ? "Copying…" : "Copy Report"}</button>
          </div>
        </div>
      </Modal>

      <Modal open={about} onClose={() => setAbout(false)} width={392}>
        <div className="p-5">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <div className="text-[16px] font-bold text-on leading-tight">{APP_NAME}</div>
              <div className="text-[11px] text-mut mt-0.5">{APP_NAME} · 第三方client v{APP_VERSION}</div>
            </div>
          </div>

          <p className="text-[12px] text-on/70 leading-relaxed mt-4">
            A cross-platform client built with Rust and Tauri 2 for Windows, macOS and Android.
            The UI follows Fluent design with an immersive vertical video feed.
          </p>

          <div className="mt-4 rounded-(--r-sm) bg-s3/60 p-3 text-[11px] text-mut leading-relaxed">
            This app is for personal learning. Videos are provided by third parties; the client does not host or distribute them.
            Please respect copyright and support authorized sources.
          </div>

          <div className="mt-4 divide-y divide-s3">
            <button onClick={() => { api.openUrl("https://github.com/zxsos/HGhubX").catch(() => { copyText("https://github.com/zxsos/HGhubX").then(() => toast("仓库地址Copied", "ok")).catch(() => {}); }); }}
              className="w-full flex items-center gap-2 py-2.5 text-left pressable">
              <ILink size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">github.com/zxsos/HGhubX</span>
              <span className="ml-auto text-[10.5px] text-primary">Copy</span>
            </button>
            <button onClick={() => {
              if (!lineBase) { toast("尚No server address configured", "info"); return; }
              copyText(lineBase).then(() => toast("Server AddressCopied", "ok")).catch(() => {});
            }}
              className="w-full flex items-center gap-2 py-2.5 text-left pressable">
              <ILink size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">{lineBase ? hostOf(lineBase) : "No server address configured"}</span>
              <span className="ml-auto text-[10.5px] text-primary">Copy</span>
            </button>
            <div className="flex items-center gap-2 py-2.5">
              <IInfo size={15} className="text-mut" />
              <span className="text-[12px] text-on/85">PolyForm Noncommercial 1.0.0</span>
              <span className="ml-auto text-[10.5px] text-mut">仅限非商业</span>
            </div>
          </div>

          <button onClick={() => setAbout(false)} className="mt-4 w-full h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on pressable">知道了</button>
        </div>
      </Modal>

      <Modal open={clearOpen} onClose={() => setClearOpen(false)} width={330}>
        <div className="p-5">
          <div className="text-[14.5px] font-bold text-on">Clear cache</div>
          <p className="text-[12px] text-mut leading-relaxed mt-2">
            只清除封面与Playback列表缓存（解密图 / m3u8）。收藏、观看记录、搜索历史与登录状态都会保留。
          </p>
          <div className="flex gap-2 mt-5">
            <button onClick={() => setClearOpen(false)} className="flex-1 h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on/80 pressable">取消</button>
            <button disabled={clearing} onClick={async () => {
              setClearing(true);
              try { await api.clearCache(); } catch { /* 忽略 */ }
              setClearing(false);
              setClearOpen(false);
              toast("缓存已清理", "ok");
            }} className="flex-1 h-9 rounded-(--r-ctl) bg-primary text-[12.5px] font-semibold text-on-primary pressable disabled:opacity-60">
              {clearing ? "清理中…" : "确定清理"}
            </button>
          </div>
        </div>
      </Modal>

      <Modal open={!!update?.has_update} onClose={() => setUpdate(null)} width={392}>
        <div className="p-5">
          <div className="text-[15px] font-bold text-on">发现新Version</div>
          <p className="text-[11.5px] text-mut mt-1.5">
            v{update?.current} → <b className="text-on">v{update?.latest}</b>
            {update?.published_at ? ` · ${update.published_at.slice(0, 10)}` : ""}
          </p>
          {!!update?.notes && (
            <div className="mt-3 max-h-[180px] scroll-y rounded-(--r-sm) bg-s2 p-3 text-[11px] text-mut whitespace-pre-wrap leading-relaxed">{update.notes}</div>
          )}
          <div className="flex gap-2 mt-4">
            <button onClick={() => setUpdate(null)} disabled={!!updating}
              className="flex-1 h-9 rounded-(--r-ctl) bg-s3 text-[12.5px] text-on/80 pressable disabled:opacity-60">Later</button>
            <button onClick={() => void doUpdate()} disabled={!!updating}
              className="flex-1 h-9 rounded-(--r-ctl) bg-primary text-[12.5px] font-semibold text-on-primary pressable disabled:opacity-60">
              {updating || "Open download page"}
            </button>
          </div>
          <div className="text-[10px] text-dim mt-2.5 break-all">{update?.url}</div>
        </div>
      </Modal>
    </div>
  );
}
