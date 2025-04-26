  // function to create space between the column.id eg CandidateName -> Candidate Name
export const formatColumnName = (columnId: string) => {
    return columnId.replace(/([A-Z])/g, ' $1').trim()
}