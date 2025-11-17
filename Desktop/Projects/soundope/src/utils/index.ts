


export function createPageUrl(pageName: string) {
    // Keep the first letter capitalized to match route definitions
    const formatted = pageName.charAt(0).toUpperCase() + pageName.slice(1).toLowerCase().replace(/ /g, '');
    return '/' + formatted;
}