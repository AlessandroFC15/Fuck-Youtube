export const getIdFromYoutubeUrl = url => new URL(url).searchParams.get('v')
