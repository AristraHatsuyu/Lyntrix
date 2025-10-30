// /composables/audio/useAudioEqualizer.ts
import { ref } from 'vue';
import type { EqualizerBand } from './audioTypes';
import { dBToLinear } from './audioUtils';

/** =========================
 * 可调参数
 * ========================= */
const EQCFG = {
    // 频段配置
    BANDS: [
        { feq: 32, type: 'lowshelf', Q: 0.707 },
        { feq: 63, type: 'peaking', Q: 1.05 },
        { feq: 125, type: 'peaking', Q: 1.10 },
        { feq: 250, type: 'peaking', Q: 1.15 },
        { feq: 500, type: 'peaking', Q: 1.20 },
        { feq: 1000, type: 'peaking', Q: 1.20 },
        { feq: 2000, type: 'peaking', Q: 1.20 },
        { feq: 4000, type: 'peaking', Q: 1.15 },
        { feq: 8000, type: 'peaking', Q: 1.10 },
        { feq: 16000, type: 'highshelf', Q: 0.707 },
    ] as const,

    // 前后保护滤波
    DC_CUT_HZ: 20,
    AIR_LOWPASS_HZ: 19500,

    // 压缩器（可关）
    COMP_ENABLED: true,
    COMP_THRESHOLD_DB: -1.0,
    COMP_KNEE: 2,
    COMP_RATIO: 10,
    COMP_ATTACK_S: 0.003,
    COMP_RELEASE_S: 0.2,

    // 预增益策略：仅在“有正向提升”时才扣，零提升时 = 0dB
    BASE_HEADROOM_DB_WHEN_BOOST: 1.5,
    DYNAMIC_MAXBOOST_RATIO: 0.5,
    DYNAMIC_EQBOOST_RATIO: 0.7,
    MAX_PREGAIN_DB: 12,

    // 平滑时长
    BAND_RAMP_S: 0.08,
    GAIN_RAMP_S: 0.05,
};

export const useAudioEqualizer = () => {
    const isEqualizerInitialized = ref(false);
    const currentPreGain = ref(0);

    let audioContext: AudioContext | null = null;
    let preGainNode: GainNode | null = null;
    let equalizerNodes: BiquadFilterNode[] = [];
    let compressorNode: DynamicsCompressorNode | null = null;

    // 复用 source
    const sourceMap = new WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>();
    let currentElement: HTMLMediaElement | null = null;
    let currentNode: MediaElementAudioSourceNode | null = null;

    const initEqualizer = () => {
        try {
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            if (!AudioContextClass) {
                console.warn('[EQ] Web Audio API not supported');
                return false;
            }
            audioContext = new AudioContextClass();

            // 频段
            equalizerNodes = EQCFG.BANDS.map((cfg) => {
                const f = audioContext!.createBiquadFilter();
                f.type = cfg.type as BiquadFilterType;
                f.frequency.value = cfg.feq;
                f.Q.value = cfg.Q;
                f.gain.value = 0;
                return f;
            });

            // 预增益：初始 0dB（零提升=与直连等响）
            preGainNode = audioContext.createGain();
            preGainNode.gain.value = 1;

            // 前后保护滤波
            const dcCut = audioContext.createBiquadFilter();
            dcCut.type = 'highpass';
            dcCut.frequency.value = EQCFG.DC_CUT_HZ;
            dcCut.Q.value = 0.707;

            const airLowpass = audioContext.createBiquadFilter();
            airLowpass.type = 'lowpass';
            airLowpass.frequency.value = EQCFG.AIR_LOWPASS_HZ;
            airLowpass.Q.value = 0.707;

            // 轻量压缩器（可关）
            if (EQCFG.COMP_ENABLED) {
                compressorNode = audioContext.createDynamicsCompressor();
                compressorNode.threshold.value = EQCFG.COMP_THRESHOLD_DB;
                compressorNode.knee.value = EQCFG.COMP_KNEE;
                compressorNode.ratio.value = EQCFG.COMP_RATIO;
                compressorNode.attack.value = EQCFG.COMP_ATTACK_S;
                compressorNode.release.value = EQCFG.COMP_RELEASE_S;
            } else {
                compressorNode = null;
            }

            // 链路：preGain -> dcCut -> eqs... -> airLowpass -> (compressor?) -> destination
            preGainNode.connect(dcCut);
            dcCut.connect(equalizerNodes[0]);
            for (let i = 0; i < equalizerNodes.length - 1; i++) {
                equalizerNodes[i].connect(equalizerNodes[i + 1]);
            }
            equalizerNodes[equalizerNodes.length - 1].connect(airLowpass);
            if (compressorNode) airLowpass.connect(compressorNode), compressorNode.connect(audioContext.destination);
            else airLowpass.connect(audioContext.destination);

            isEqualizerInitialized.value = true;
            return true;
        } catch (e) {
            console.error('[EQ] Initialization failed:', e);
            return false;
        }
    };

    /** 仅当存在正向提升时才扣预增益；无提升返回 0dB */
    const calculatePreGain = (settings: EqualizerBand[]): number => {
        const pos = settings.map(b => Math.max(0, b.value - 12));
        const hasBoost = pos.some(v => v > 0);
        if (!hasBoost) return 0;

        const weights = [1.8, 1.6, 1.4, 1.2, 1.0, 1.0, 0.9, 0.9, 0.8, 0.7];
        const maxBoost = Math.max(0, ...pos);

        let wSum = 0, linSum = 0;
        for (let i = 0; i < pos.length; i++) {
            if (pos[i] > 0) {
                const w = weights[i];
                wSum += w;
                linSum += w * Math.pow(10, pos[i] / 20);
            }
        }
        const eqBoostDB = (wSum > 0) ? 20 * Math.log10(linSum / wSum) : 0;
        const dynamicCut = Math.max(maxBoost * EQCFG.DYNAMIC_MAXBOOST_RATIO,
            eqBoostDB * EQCFG.DYNAMIC_EQBOOST_RATIO);
        const preGainDB = EQCFG.BASE_HEADROOM_DB_WHEN_BOOST + dynamicCut;
        return Math.max(0, Math.min(EQCFG.MAX_PREGAIN_DB, preGainDB));
    };

    // 绑定/复用 SourceNode
    const ensureNode = (audioEl: HTMLMediaElement) => {
        if (!audioContext) throw new Error('[EQ] No AudioContext');
        if (currentElement === audioEl && currentNode) return currentNode;
        if (currentNode) { try { currentNode.disconnect(); } catch { } }
        currentElement = audioEl;

        const existed = sourceMap.get(audioEl);
        if (existed) currentNode = existed;
        else {
            currentNode = audioContext.createMediaElementSource(audioEl);
            sourceMap.set(audioEl, currentNode);
        }
        return currentNode!;
    };

    /** 连接到 EQ 链路 */
    const connectAudioToEqualizer = (audioEl: HTMLMediaElement | null) => {
        if (!audioEl || !audioContext || !preGainNode) return;
        const node = ensureNode(audioEl);
        try { node.disconnect(); } catch { }
        node.connect(preGainNode);
    };

    /** 旁路直连（关闭 EQ） */
    const connectBypass = (audioEl: HTMLMediaElement | null) => {
        if (!audioEl || !audioContext) return;
        const node = ensureNode(audioEl);
        try { node.disconnect(); } catch { }
        node.connect(audioContext.destination);
    };

    /** 仅断开当前 node */
    const disconnectAudio = () => { if (currentNode) { try { currentNode.disconnect(); } catch { } } };

    const applyEqualizerSettings = (settings: EqualizerBand[]) => {
        if (!isEqualizerInitialized.value || !audioContext || !preGainNode) return;
        const now = audioContext.currentTime;

        // 设置各频段
        for (let i = 0; i < settings.length; i++) {
            const band = settings[i];
            const node = equalizerNodes[i];
            if (!node) continue;
            const targetDB = Math.max(-12, Math.min(12, band.value - 12));
            node.gain.cancelScheduledValues(now);
            node.gain.setValueAtTime(node.gain.value, now);
            node.gain.linearRampToValueAtTime(targetDB, now + EQCFG.BAND_RAMP_S);
        }

        // 动态预增益（只衰减、不增强）
        const preGainDB = calculatePreGain(settings); // 可能为 0
        currentPreGain.value = preGainDB;

        const linear = dBToLinear(-preGainDB);
        preGainNode.gain.cancelScheduledValues(now);
        preGainNode.gain.setValueAtTime(preGainNode.gain.value, now);
        preGainNode.gain.linearRampToValueAtTime(linear, now + EQCFG.GAIN_RAMP_S);
    };

    const ensureAudioContextRunning = async () => {
        if (audioContext && audioContext.state === 'suspended') {
            try { await audioContext.resume(); } catch { }
        }
    };

    const destroyEqualizer = async () => {
        disconnectAudio();
        equalizerNodes.forEach(n => { try { n.disconnect(); } catch { } });
        equalizerNodes = [];
        if (audioContext && audioContext.state !== 'closed') await audioContext.close();
        audioContext = null;
        currentElement = null;
        currentNode = null;
        isEqualizerInitialized.value = false;
    };

    return {
        isEqualizerInitialized,
        currentPreGain,
        initEqualizer,
        connectAudioToEqualizer,
        connectBypass,
        disconnectAudio,
        applyEqualizerSettings,
        ensureAudioContextRunning,
        destroyEqualizer
    };
};
