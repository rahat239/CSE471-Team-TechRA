import create from "zustand";

const PcBuilderStore = create((set, get) => ({
    prices: { case: 6500, fan: 8000, gpu: 78000, ram: 4500 },

    fanSlots: [
        { id: "fan-top-left", occupied: false },
        { id: "fan-top-right", occupied: false },
        { id: "fan-front-upper", occupied: false },
        { id: "fan-front-lower", occupied: false },
        { id: "fan-rear", occupied: false },
    ],
    gpuSlot: { id: "gpu-main", occupied: false },
    ramSlots: [
        { id: "ram-a1", occupied: false },
        { id: "ram-a2", occupied: false },
        { id: "ram-b1", occupied: false },
        { id: "ram-b2", occupied: false },
    ],

    // <-- NEW: which component type to display in 3D -->
    activeComponent: null, // "gpu" | "ram" | "fan" | null
    setActiveComponent: (type) => set({ activeComponent: type }),

    toggleFan: (id) =>
        set((state) => ({
            fanSlots: state.fanSlots.map((s) =>
                s.id === id ? { ...s, occupied: !s.occupied } : s
            ),
            activeComponent: "fan",
        })),

    toggleGPU: () =>
        set((state) => ({
            gpuSlot: { ...state.gpuSlot, occupied: !state.gpuSlot.occupied },
            activeComponent: "gpu",
        })),

    toggleRAM: (id) =>
        set((state) => ({
            ramSlots: state.ramSlots.map((s) =>
                s.id === id ? { ...s, occupied: !s.occupied } : s
            ),
            activeComponent: "ram",
        })),

    resetAll: () =>
        set(() => ({
            fanSlots: [
                { id: "fan-top-left", occupied: false },
                { id: "fan-top-right", occupied: false },
                { id: "fan-front-upper", occupied: false },
                { id: "fan-front-lower", occupied: false },
                { id: "fan-rear", occupied: false },
            ],
            gpuSlot: { id: "gpu-main", occupied: false },
            ramSlots: [
                { id: "ram-a1", occupied: false },
                { id: "ram-a2", occupied: false },
                { id: "ram-b1", occupied: false },
                { id: "ram-b2", occupied: false },
            ],
            activeComponent: null,
        })),

    totals: () => {
        const { prices, fanSlots, gpuSlot, ramSlots } = get();
        const baseCase = 1;
        const fans = fanSlots.filter((s) => s.occupied).length;
        const gpu = gpuSlot.occupied ? 1 : 0;
        const ram = ramSlots.filter((s) => s.occupied).length;
        const items = baseCase + fans + gpu + ram;
        const cost =
            prices.case +
            fans * prices.fan +
            gpu * prices.gpu +
            ram * prices.ram;
        return { baseCase, fans, gpu, ram, items, cost };
    },
}));

export default PcBuilderStore;