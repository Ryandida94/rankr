import React from 'react'
import { connect } from 'react-redux'
import { EuiFieldSearch, EuiFlexGroup, EuiFlexItem } from '@elastic/eui'

import { CountrySelect, RankingTable, SuperSelect } from '..'
import {
  rankingSystemsActions,
  rankingTableActions
} from '../../redux/reducers'

const RankingTableCard = props => {
  const { rankingSystems, rankingTable } = props.state
  const {
    getRankingSystems,
    clearCurrentRankingSystems,
    getRankingTable,
    clearCurrentRankingTable
  } = props
  const [systems, setSystems] = React.useState([])
  const [years, setYears] = React.useState([])
  const [selectedSystem, setSelectedSystem] = React.useState('')
  const [selectedYear, setSelectedYear] = React.useState('')
  const [countries, setCountries] = React.useState([])
  const [selectedCountries, setSelectedCountries] = React.useState([])
  const [data, setData] = React.useState([])
  const [searchValue, setSearchValue] = React.useState('')

  React.useEffect(() => {
    getRankingSystems()
    return () => clearCurrentRankingSystems()
  }, [clearCurrentRankingSystems, getRankingSystems])

  React.useEffect(() => {
    const systems = Object.keys(rankingSystems.currentRankingSystems)
    if (rankingSystems.currentRankingSystems && systems.length) {
      setSystems(systems)
      setSelectedSystem(systems[0])
    }
  }, [rankingSystems.currentRankingSystems])

  React.useEffect(() => {
    if (systems.length && selectedSystem) {
      let years = rankingSystems.currentRankingSystems[selectedSystem]
      years = [...years].sort((a, b) => b - a)
      setYears(years)
      setSelectedYear(years[0])
    }
  }, [rankingSystems.currentRankingSystems, selectedSystem, systems])

  React.useEffect(() => {
    if (selectedSystem && selectedYear) {
      getRankingTable({
        rankingSystem: selectedSystem,
        year: selectedYear,
        limit: 0
      })
      setSearchValue('')
      setSelectedCountries([])
    }
    return () => clearCurrentRankingTable()
  }, [clearCurrentRankingTable, getRankingTable, selectedSystem, selectedYear])

  React.useEffect(() => {
    if (
      rankingTable.currentRankingTable &&
      rankingTable.currentRankingTable.length
    ) {
      setData(rankingTable.currentRankingTable)
      const countriesArray = rankingTable.currentRankingTable.map(i => ({
        label: i.institution.country.country,
        value: { countryCode: i.institution.country.country_code }
      }))

      const uniqueCountires = Array.from(
        new Set(countriesArray.map(JSON.stringify))
      )
        .map(JSON.parse)
        .sort((a, b) => a.label.localeCompare(b.label))
      setCountries(uniqueCountires)
    }
  }, [rankingTable.currentRankingTable])

  React.useEffect(() => {
    if (selectedCountries.length) {
      const countries = selectedCountries.map(i => i.label)
      setData(
        rankingTable.currentRankingTable.filter(i =>
          countries.includes(i.institution.country.country)
        )
      )
    } else {
      setData(rankingTable.currentRankingTable)
    }
  }, [rankingTable.currentRankingTable, selectedCountries])

  const onSearchChange = React.useCallback(
    e => {
      setSearchValue(e.target.value)
      if (e.target.value) {
        setData(
          data.filter(i =>
            i.institution.soup
              .toLowerCase()
              .includes(e.target.value.toLowerCase())
          )
        )
      } else setData(data)
    },
    [data]
  )

  const onCountriesChange = selectedCountries => {
    console.log(selectedCountries)
    setSelectedCountries(selectedCountries)
    setSearchValue('')
  }

  return (
    <>
      <EuiFlexGroup gutterSize='m'>
        <EuiFlexItem grow={5}>
          <SuperSelect
            key='ranking system select'
            isLoading={rankingSystems.isLoading}
            options={systems}
            onSelectChange={value => setSelectedSystem(value)}
            selectedValue={selectedSystem}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={false}>
          <SuperSelect
            key='ranking year select'
            isLoading={rankingSystems.isLoading}
            options={years}
            onSelectChange={value => setSelectedYear(value)}
            selectedValue={selectedYear}
          />
        </EuiFlexItem>
        <EuiFlexItem grow={7}>
          <EuiFieldSearch
            value={searchValue}
            onChange={onSearchChange}
            placeholder='Institution filter'
            compressed
          />
        </EuiFlexItem>
        <EuiFlexItem grow={7}>
          <CountrySelect
            isLoading={rankingTable.isLoading}
            options={countries}
            onSelectChange={onCountriesChange}
            selectedValues={selectedCountries}
          />
        </EuiFlexItem>
      </EuiFlexGroup>
      <RankingTable
        // key={`${selectedSystem}-${selectedYear}`}
        isLoading={rankingTable.isLoading}
        data={data}
      />
    </>
  )
}

const mapStateToProps = state => ({
  state: {
    rankingSystems: {
      isLoading: state.rankingSystems.isLoading,
      currentRankingSystems: state.rankingSystems.currentRankingSystems,
      error: state.rankingSystems.error
    },
    rankingTable: {
      isLoading: state.rankingTable.isLoading,
      currentRankingTable: state.rankingTable.currentRankingTable,
      error: state.rankingTable.error
    }
  }
})
const mapDispatchToProps = {
  getRankingSystems: rankingSystemsActions.getRankingSystems,
  clearCurrentRankingSystems: rankingSystemsActions.clearCurrentRankingSystems,
  getRankingTable: rankingTableActions.getRankingTable,
  clearCurrentRankingTable: rankingTableActions.clearCurrentRankingTable
}
export default connect(mapStateToProps, mapDispatchToProps)(RankingTableCard)