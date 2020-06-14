function calc_bus_risk(number_masks, people_risk_scores, duration) {
    let total_risk = 1
    for (let person_risk of people_risk_scores) {
        total_risk *= (1-person_risk)
    }
    total_risk = 1 - total_risk

    const prop_mask = number_masks / people_risk_scores.length
    const mask_risk = max(prop_mask * (17.4/3.1), 1)
    total_risk /= mask_risk

    const duration_prop = min(duration / 50, 1)
    total_risk *= duration_prop

    return total_risk
}

function calc_person_risk(last_ride_risk, historical_risk) {
    const risks = historical_risk + [last_ride_risk]

    total_risk = 1
    for (let risk of risks) {
        total_risk *= (1-risk)
    }
    total_risk = 1 - total_risk
}