
export const setupAnalytics = () => {
    if (window.analytics) { throw new Error('analytics already setup') }

    const analytics = new EventTarget()

    window.analytics = analytics

    console.log('ANALYTICS: initialized')

    return analytics
}

export const sendEvent = (analytics = window.analytics, eventName, eventProperties) => {
    if (!analytics) { return console.log('ANALYTICS: not initialized') }

    try {
        analytics.dispatchEvent(new Event(eventName, eventProperties));
        console.log('ANALYTICS: sent event', eventName, eventProperties);
    } catch (e) {
        console.log('ANALYTICS: Ignoring analytics error', e);
    }
}

