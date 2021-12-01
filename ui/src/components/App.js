import React from "react";
import * as ReactDOM from "react-dom";

import {alertRef} from "./AutoHideAlert.js";
import {MintModal} from "./MintModal.js";
import AutoHideAlert from "./AutoHideAlert.js";

const App = () => {
    return <div>
        <AutoHideAlert ref={alertRef} />
        <MintModal />
    </div>
}

const createDOMElement = () => {
    const body = document.getElementsByTagName('body')[0];
    const div = Object.assign(document.createElement('div'), {
        id: "root",
    });
    body.appendChild(div);
    return div;
}

export const renderAppContainer = () => {
    const elem = createDOMElement();
    ReactDOM.render(
        <App />,
        elem
    )
}
