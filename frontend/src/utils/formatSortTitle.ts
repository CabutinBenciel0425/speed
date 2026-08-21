export const formatSortTitle = (title: string) => {
  const titleArr = title.split("")
  let formattedTitle: string

  if (titleArr.includes("-")) {
    formattedTitle = titleArr.slice(1).join("")
  } else {
    formattedTitle = titleArr.join("")
  }
  return formattedTitle.at(0)?.toUpperCase() + formattedTitle.slice(1)
}
