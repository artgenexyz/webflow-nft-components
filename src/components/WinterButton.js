import { getBaseURL } from "../constants";
import AwaitingButton, { LoadingState } from "./AwaitingButton";
import React, { useState } from "react";
import WinterModal, { isWinterCheckoutEnabled } from "./WinterCheckout";

export const WinterButton = ({ project, quantity, launchType }) => {
    const [winterLoadingState, setWinterLoadingState] = useState(LoadingState.NOT_STARTED)
    const [showWinter, setShowWinter] = useState(false)

    return <>
        {isWinterCheckoutEnabled(project, launchType) && <AwaitingButton
            loadingState={winterLoadingState}
            setLoadingState={setWinterLoadingState}
            loadingText="Loading Winter..."
            onClick={() => setShowWinter(true)}
            sx={{ mt: 2, width: "100%" }}
            variant="contained">
        <img src={`${getBaseURL()}/images/winter.png`} style={{ width: 16, marginRight: 4 }} /> Mint with card
        </AwaitingButton>}
        <WinterModal
            project={project}
            mintQuantity={quantity}
            showWinter={showWinter}
            setShowWinter={setShowWinter}
            onClose={() => setWinterLoadingState(LoadingState.NOT_STARTED)}
        />
    </>
}