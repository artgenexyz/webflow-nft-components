import React from "react";
import {alertRef} from "./AutoHideAlert.js";
import {MintModal} from "./MintModal.js";
import AutoHideAlert from "./AutoHideAlert.js";

export const App = () => {
    return <div>
        <AutoHideAlert ref={alertRef} />
        <MintModal />
    </div>
}
