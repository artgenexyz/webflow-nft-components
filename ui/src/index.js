import React from 'react';
import { render } from "react-dom";
import AutoHideAlert from "./components/AutoHideAlert.js";

const DevApp = () => (
    <div style={{ width: 640, margin: "15px auto" }}>
        <h1>Components testing</h1>
        <AutoHideAlert />
    </div>
);

render(<DevApp />, document.getElementById("root"));
