import { BaseTeamTile, SubmissionStatus } from "./api";

// https://stackoverflow.com/a/30470303
export function dataURLtoBlob(dataurl: string) {
    var arr = dataurl.split(','), mime = arr[0].match(/:(.*?);/)![1],
        bstr = window.atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}
export function backgroundColorFromTile(tile: BaseTeamTile): string {
    if (tile.submitted === false) return ""
    switch (tile.status) {
        case SubmissionStatus.RECEIVED:
            return "yellow"
        case SubmissionStatus.APPROVED:
            return "green"
        case SubmissionStatus.REJECTED:
            return "red"
        case SubmissionStatus.WAITING:
            return "orange"
    }
}
