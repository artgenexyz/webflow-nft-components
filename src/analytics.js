
export const setupAnalytics = () => {
    if (window.analytics) { throw new Error("analytics already setup") }

    const analytics = new EventTarget()

    window.analytics = analytics

    return analytics
}

export const sendEvent = (analytics = window.analytics, eventName, eventProperties) => {
    if (!analytics) { console.log("analytics not initialized") }

    try {
        analytics.dispatchEvent(new Event(eventName), eventProperties);
    } catch (e) {
        console.log('Ignoring analytics error', e);
    }
}

