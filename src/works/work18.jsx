import React, { useState } from "react";
import Img from "../Components/gallerygrid/Img";

function Work18() {
    // States for the first GSM calculator (length, width, weight)
    const [weight, setWeight] = useState("");
    const [length, setLength] = useState("");
    const [width, setWidth] = useState("");
    const [gsm, setGsm] = useState(null);
    const [lengthUnit, setLengthUnit] = useState("meters");
    const [weightUnit, setWeightUnit] = useState("grams");

    // States for the second GSM calculator (EPI, PPI, warp count, weft count)
    const [epi, setEpi] = useState("");
    const [ppi, setPpi] = useState("");
    const [warpCount, setWarpCount] = useState("");
    const [weftCount, setWeftCount] = useState("");
    const [warpUnit, setWarpUnit] = useState("Ne");
    const [weftUnit, setWeftUnit] = useState("Ne");
    const [gsmFabric, setGsmFabric] = useState(null);

    // Function to convert weight to grams
    const convertWeightToGrams = (weight, unit) => {
        switch (unit) {
            case "kilograms":
                return weight * 1000;
            case "ounces":
                return weight * 28.3495;
            case "pounds":
                return weight * 453.592;
            default:
                return weight; // already in grams
        }
    };

    // Function to convert length and width to meters
    const convertToMeters = (value, unit) => {
        switch (unit) {
            case "centimeters":
                return value / 100;
            case "inches":
                return value * 0.0254;
            default:
                return value; // already in meters
        }
    };

    // Function to calculate GSM from length, width, and weight
    const calculateGSM = (e) => {
        e.preventDefault();
        if (weight && length && width) {
            const weightInGrams = convertWeightToGrams(weight, weightUnit);
            const lengthInMeters = convertToMeters(length, lengthUnit);
            const widthInMeters = convertToMeters(width, lengthUnit);

            const area = lengthInMeters * widthInMeters;
            const result = (weightInGrams / area).toFixed(2);
            setGsm(result);
        } else {
            alert("Please enter weight, length, and width.");
        }
    };

    // Function to calculate GSM from EPI, PPI, warp count, and weft count
    const calculateGSMFabric = (e) => {
        e.preventDefault();
        if (epi && ppi && warpCount && weftCount) {
            const warpFactor = convertCountToDenier(warpCount, warpUnit);
            const weftFactor = convertCountToDenier(weftCount, weftUnit);

            // Formula: GSM = (EPI / WarpFactor) + (PPI / WeftFactor) × 23.5
            const result = (((epi / warpFactor) + (ppi / weftFactor)) * 23.5).toFixed(2);
            setGsmFabric(result);
        } else {
            alert("Please enter EPI, PPI, warp count, and weft count.");
        }
    };

    // Convert any yarn count (Ne, Nm, Tex, Denier) to Denier for calculation
    const convertCountToDenier = (count, unit) => {
        switch (unit) {
            case "Ne":
                return 5315 / count; // Conversion from Ne to Denier
            case "Nm":
                return 9000 / count; // Conversion from Nm to Denier
            case "Tex":
                return count * 9; // Conversion from Tex to Denier
            case "Denier":
                return count; // Already in Denier
            default:
                return count;
        }
    };

    return (
        <>
            <div className='grid_container_25'>
                <div className='colstart3 colend24'>
                    <br /><br />
                    <br /><br />

                    <h1>Textile GSM Calculator</h1>
                    <br />

                    {/* Formula Display */}
                    <div className="text halffull">
                        GSM Formula 1: GSM = Weight (grams) / (Length (meters) × Width (meters))
                    </div>
                    <div className="text halffull">
                        GSM Formula 2: GSM = ((EPI / WarpFactor) + (PPI / WeftFactor)) × 23.5
                    </div>
                    <br /><br />

                    <span id="fameforever" className="bookmark_positioner"></span>
                    <div className="overflowhidden noflexinphone">

                        {/* GSM Calculator 1: Length, Width, Weight */}
                        <div>
                            <h2>GSM Calculator (Weight, Length, Width)</h2>
                            <form onSubmit={calculateGSM}>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Weight:
                                        <input
                                            type="number"
                                            value={weight}
                                            onChange={(e) => setWeight(e.target.value)}
                                            placeholder={`Enter fabric weight in ${weightUnit}`}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                    <label>
                                        <select
                                            value={weightUnit}
                                            onChange={(e) => setWeightUnit(e.target.value)}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        >
                                            <option value="grams">Grams</option>
                                            <option value="kilograms">Kilograms</option>
                                            <option value="ounces">Ounces</option>
                                            <option value="pounds">Pounds</option>
                                        </select>
                                    </label>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Length:
                                        <input
                                            type="number"
                                            value={length}
                                            onChange={(e) => setLength(e.target.value)}
                                            placeholder={`Enter fabric length in ${lengthUnit}`}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Width:
                                        <input
                                            type="number"
                                            value={width}
                                            onChange={(e) => setWidth(e.target.value)}
                                            placeholder={`Enter fabric width in ${lengthUnit}`}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                </div>

                                {/* Unit selection for length and width */}
                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Choose Unit for Length & Width:
                                        <select
                                            value={lengthUnit}
                                            onChange={(e) => setLengthUnit(e.target.value)}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        >
                                            <option value="meters">Meters</option>
                                            <option value="centimeters">Centimeters</option>
                                            <option value="inches">Inches</option>
                                        </select>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        padding: "10px 20px",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Calculate GSM
                                </button>
                            </form>

                            {gsm && (
                                <div style={{ marginTop: "20px" }}>
                                    <h3>Calculated GSM: {gsm} g/m²</h3>
                                </div>
                            )}
                        </div>

                        {/* GSM Calculator 2: EPI, PPI, Warp Count, Weft Count */}
                        <div>
                            <h2>GSM Calculator (EPI, PPI, Warp Count, Weft Count)</h2>
                            <form onSubmit={calculateGSMFabric}>
                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        EPI (Ends per Inch):
                                        <input
                                            type="number"
                                            value={epi}
                                            onChange={(e) => setEpi(e.target.value)}
                                            placeholder="Enter EPI"
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        PPI (Picks per Inch):
                                        <input
                                            type="number"
                                            value={ppi}
                                            onChange={(e) => setPpi(e.target.value)}
                                            placeholder="Enter PPI"
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Warp Count:
                                        <input
                                            type="number"
                                            value={warpCount}
                                            onChange={(e) => setWarpCount(e.target.value)}
                                            placeholder="Enter Warp Count"
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                    <label>
                                        <select
                                            value={warpUnit}
                                            onChange={(e) => setWarpUnit(e.target.value)}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        >
                                            <option value="Ne">Ne</option>
                                            <option value="Nm">Nm</option>
                                            <option value="Tex">Tex</option>
                                            <option value="Denier">Denier</option>
                                        </select>
                                    </label>
                                </div>

                                <div style={{ marginBottom: "10px" }}>
                                    <label>
                                        Weft Count:
                                        <input
                                            type="number"
                                            value={weftCount}
                                            onChange={(e) => setWeftCount(e.target.value)}
                                            placeholder="Enter Weft Count"
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        />
                                    </label>
                                    <label>
                                        <select
                                            value={weftUnit}
                                            onChange={(e) => setWeftUnit(e.target.value)}
                                            style={{ width: "100%", padding: "8px", margin: "5px 0" }}
                                        >
                                            <option value="Ne">Ne</option>
                                            <option value="Nm">Nm</option>
                                            <option value="Tex">Tex</option>
                                            <option value="Denier">Denier</option>
                                        </select>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    style={{
                                        backgroundColor: "#4CAF50",
                                        color: "white",
                                        padding: "10px 20px",
                                        border: "none",
                                        cursor: "pointer",
                                    }}
                                >
                                    Calculate GSM
                                </button>
                            </form>

                            {gsmFabric && (
                                <div style={{ marginTop: "20px" }}>
                                    <h3>Calculated GSM (Fabric): {gsmFabric} g/m²</h3>
                                </div>
                            )}
                        </div>
                    </div>
                    <br />

                    <span id="fameforever" className="bookmark_positioner"></span>
                    <div className="overflowhidden noflexinphone">
                        <Img height="auto" src='\images\works\lifestyle\a0.png' alt="document page 0" />
                    </div>
                    <br />

                    <br />
                    <br /><br /><br />
                </div>
            </div>
        </>
    );
}

export default Work18;
