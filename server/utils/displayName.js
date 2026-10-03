function getDisplayName(email) {

    if (!email) return "Anonymous";

    return email
        .split("@")[0]
        .replace(/[0-9]+$/, "")
        .replace(/^./, char => char.toUpperCase());

}

module.exports = getDisplayName;