const BASE_SMILE_IMAGE_URL = "https://cactus.nci.nih.gov/chemical/structure/"


export const smileToImageUrl = (smile: string) => {
    const formattedString = smile.replace(/#/g, "%23");

    return BASE_SMILE_IMAGE_URL + formattedString + "/image"
}