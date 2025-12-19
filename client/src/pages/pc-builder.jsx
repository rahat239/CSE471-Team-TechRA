import React from "react";
import { Link } from "react-router-dom";
import PCBuilder3D from "../components/pcbuilder/PCBuilder3D";
import PcBuilder from "../store/PcBuilderStore";

const currency = (n) => `BDT. ${(n ?? 0).toLocaleString("en-BD")}`;

const PcBuilderPage = () => {
    // --- Store state ---
    const prices   = PcBuilder((s) => s.prices);
    const fanSlots = PcBuilder((s) => s.fanSlots);
    const gpuSlot  = PcBuilder((s) => s.gpuSlot);
    const ramSlots = PcBuilder((s) => s.ramSlots);

    const toggleFan = PcBuilder((s) => s.toggleFan);
    const toggleGPU = PcBuilder((s) => s.toggleGPU);
    const toggleRAM = PcBuilder((s) => s.toggleRAM);
    const resetAll  = PcBuilder((s) => s.resetAll);

    // --- Totals fix ---
    const t = PcBuilder((s) => s.totals)();

    const fanCount = fanSlots.filter((f) => f.occupied).length;
    const ramCount = ramSlots.filter((r) => r.occupied).length;

    const subtotal =
        (prices.case ?? 0) +
        fanCount * (prices.fan ?? 0) +
        (gpuSlot.occupied ? prices.gpu ?? 0 : 0) +
        ramCount * (prices.ram ?? 0);

    return (
        <div className="container py-4">
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h3 className="m-0">PC Builder (3D)</h3>
                <div>
                    <button className="btn btn-outline-secondary me-2" onClick={resetAll}>
                        Reset
                    </button>
                    <Link className="btn btn-success" to="/">
                        Back to Home
                    </Link>
                </div>
            </div>

            <div className="row g-4">
                {/* LEFT: 3D Scene */}
                <div className="col-lg-8">
                    <div className="card shadow-sm">
                        <div className="card-body" style={{ height: "520px", padding: 0 }}>
                            <PCBuilder3D />
                        </div>
                    </div>
                </div>

                {/* RIGHT: Component Controls */}
                <div className="col-lg-4">
                    <div className="card shadow-sm mb-3">
                        <div className="card-header bg-white">
                            <strong>Components</strong>
                        </div>
                        <div className="card-body">
                            {/* GPU Section */}
                            <div className="mb-3">
                                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    GPU <small className="text-muted">(click to show/remove)</small>
                  </span>
                                    <button
                                        className={`btn btn-sm ${gpuSlot.occupied ? "btn-danger" : "btn-outline-primary"}`}
                                        onClick={toggleGPU}
                                    >
                                        {gpuSlot.occupied ? "Remove GPU" : "Add GPU"}
                                    </button>
                                </div>
                            </div>

                            {/* RAM Section */}
                            <div className="mb-3">
                                <div className="fw-semibold mb-2">RAM</div>
                                {ramSlots.map((r) => (
                                    <div key={r.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <span>{r.id.toUpperCase()}</span>
                                        <button
                                            className={`btn btn-sm ${r.occupied ? "btn-danger" : "btn-outline-primary"}`}
                                            onClick={() => toggleRAM(r.id)}
                                        >
                                            {r.occupied ? "Remove" : "Add"} ({currency(prices.ram)})
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Fans Section */}
                            <div className="mb-3">
                                <div className="fw-semibold mb-2">Case Fans</div>
                                {fanSlots.map((f) => (
                                    <div key={f.id} className="d-flex justify-content-between align-items-center mb-2">
                                        <span>{f.id.replace("fan-", "Fan ").toUpperCase()}</span>
                                        <button
                                            className={`btn btn-sm ${f.occupied ? "btn-danger" : "btn-outline-primary"}`}
                                            onClick={() => toggleFan(f.id)}
                                        >
                                            {f.occupied ? "Remove" : "Add"} ({currency(prices.fan)})
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Summary */}
                    <div className="card shadow-sm">
                        <div className="card-header bg-white">
                            <strong>Summary</strong>
                        </div>
                        <div className="card-body">
                            <div className="d-flex justify-content-between">
                                <span>Case</span>
                                <span>{currency(prices.case)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>Fans x{fanCount}</span>
                                <span>{currency(fanCount * (prices.fan ?? 0))}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>GPU</span>
                                <span>{currency(gpuSlot.occupied ? prices.gpu ?? 0 : 0)}</span>
                            </div>
                            <div className="d-flex justify-content-between">
                                <span>RAM x{ramCount}</span>
                                <span>{currency(ramCount * (prices.ram ?? 0))}</span>
                            </div>
                            <hr />
                            <div className="d-flex justify-content-between fw-bold">
                                <span>Subtotal</span>
                                <span>{currency(subtotal)}</span>
                            </div>
                            <small className="text-muted d-block mt-1">
                                Items: {t.items} • Store total: {currency(t.cost)}
                            </small>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PcBuilderPage;