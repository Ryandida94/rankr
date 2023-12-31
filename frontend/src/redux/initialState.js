const initialState = {
  compare: {
    isLoadingSearch: false,
    institutions: [],
    errorSearch: null,
    selectedInstitutions: [],
    selectedRankingSystem: '',
    selectedRankingYear: '',
    isLoadingRanks: false,
    isLoadingScores: false,
    currentRankings: { ranks: [], scores: [] },
    errorRankings: null
  },
  institutions: {
    isLoading: false,
    currentInstitutions: [],
    selectedInstitutions: [],
    error: null
  },
  rankings: {
    isLoading: false,
    currentRankings: { ranks: [], scores: [] },
    error: null
  },
  rankingSystems: { isLoading: false, currentRankingSystems: {}, error: null },
  rankingTable: { isLoading: false, currentRankingTable: [], error: null },
  search: { isLoading: false, institutions: [], error: null },
  wiki: { isLoading: false, currentWikiPage: null, error: null }
}

export default initialState
