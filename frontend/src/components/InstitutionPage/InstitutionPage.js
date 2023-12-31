import React from 'react'
import { Helmet } from 'react-helmet'
import { connect } from 'react-redux'
import { useParams } from 'react-router-dom'
import {
  EuiPage,
  EuiPageContent,
  EuiPageBody,
  EuiPageContentBody,
  EuiSpacer,
  EuiStat,
  EuiTab,
  EuiTabs
} from '@elastic/eui'

import {
  BarChart,
  ComparePage,
  InstitutionPageHeader,
  LineChart,
  LoadingPage,
  NotFoundPage,
  YearRange
} from '..'
import * as c from '../../config'
import { useWindowDimensions } from '../../hooks'
import {
  institutionActions,
  rankingActions,
  wikiActions
} from '../../redux/reducers'
import { r } from '../../routes'
import '../../types'
import {
  formatURL,
  institutionStats,
  rankChartProps,
  scoreChartProps
} from '../../utils'

const InstitutionPage = props => {
  /** @type {{
    currentInstitutions: Array.<Institution>, isLoading: boolean, error: any
  }} */
  const institutions = props.state.institutions
  /** @type {{
    currentRankings: {ranks: Array.<Ranking>, scores: Array.<Ranking>},
    isLoading: boolean,
    error: any
  }} */
  const rankings = props.state.rankings
  /** @type {{currentWikiPage: string, isLoading: boolean, error: any}} */
  const wiki = props.state.wiki
  const {
    getInstitutionByID,
    clearCurrentInstitutions,
    getRanksByInstitutionID,
    getScoresByInstitutionID,
    clearCurrentRankings,
    getWikiPage,
    clearCurrentWikiPage
  } = props

  /** @type {Institution|null} */
  const initialInst = null
  const [inst, setInst] = React.useState(initialInst)

  const [instStats, setInstStats] = React.useState(null)
  const tabs = [
    { id: 'ranks', name: 'Ranks' },
    { id: 'scores', name: 'Scores' },
    { id: 'compare', name: 'Compare' }
  ]
  const [selectedTabID, setSelectedTabID] = React.useState('overview')
  const [rankChart, setRankChart] = React.useState(null)
  const [scoreChart, setScoreChart] = React.useState(null)
  const [pageContent, setPageContent] = React.useState(null)
  const [scoreYear, setScoreYear] = React.useState(null)
  const [slider, setSlider] = React.useState(null)
  const onYearChange = e => setScoreYear(parseInt(e.target.value))
  const onSelectedTabChanged = id => setSelectedTabID(id)
  const { institutionID } = useParams()
  const { width } = useWindowDimensions()

  React.useEffect(() => {
    if (institutionID) {
      getInstitutionByID({ institutionID })
      setSelectedTabID('ranks')
      setScoreYear(null)
    }
    return () => clearCurrentInstitutions()
  }, [institutionID, getInstitutionByID, clearCurrentInstitutions])

  React.useEffect(() => {
    if (institutions.currentInstitutions.length) {
      setInst(institutions.currentInstitutions[0])
    }
    return () => setInst(null)
  }, [institutions.currentInstitutions])

  React.useEffect(() => {
    if (inst) {
      setInstStats(
        institutionStats(inst.stats).map(i => (
          <EuiStat key='' {...i} titleSize='s' />
        ))
      )
    }
  }, [inst])

  React.useEffect(() => {
    if (inst) {
      const wikiURL = inst.links.find(link => link.type === 'wikipedia')?.link
      if (wikiURL) getWikiPage({ url: wikiURL })
    }
    return () => clearCurrentWikiPage()
  }, [inst, getWikiPage, clearCurrentWikiPage])

  React.useEffect(() => {
    if (inst) getRanksByInstitutionID({ institution_id: inst.id })
    return () => clearCurrentRankings()
  }, [inst, getRanksByInstitutionID, clearCurrentRankings])

  React.useEffect(() => {
    if (inst) getScoresByInstitutionID({ institution_id: inst.id })
    return () => clearCurrentRankings()
  }, [inst, getScoresByInstitutionID, clearCurrentRankings])

  React.useEffect(() => {
    if (inst?.name && rankings.currentRankings.ranks.length) {
      const chartProps = rankChartProps({
        rawData: rankings.currentRankings.ranks
      })
      setRankChart(
        <LineChart chartTitle={`Ranks: ${inst.name}`} {...chartProps} />
      )
    }
  }, [inst, rankings.currentRankings.ranks])

  React.useEffect(() => {
    if (inst?.name && rankings.currentRankings.scores.length) {
      const years = new Set(rankings.currentRankings.scores.map(i => i.year))
      if (!scoreYear) setScoreYear(Math.max(...years))
      const chartProps = scoreChartProps({
        rawData: rankings.currentRankings.scores,
        filters: { year: scoreYear }
      })
      setSlider(
        <YearRange years={years} value={scoreYear} onChange={onYearChange} />
      )
      setScoreChart(
        <BarChart
          chartTitle={`Scores: ${inst.name} - ${scoreYear}`}
          {...chartProps}
        />
      )
    }
  }, [inst, rankings.currentRankings.scores, scoreYear])

  React.useEffect(() => {
    if (selectedTabID === 'ranks' && rankings.isLoading) {
      setPageContent(<LoadingPage />)
    }
    if (selectedTabID === 'ranks') setPageContent(rankChart)
  }, [rankChart, rankings.isLoading, selectedTabID])

  React.useEffect(() => {
    if (selectedTabID === 'scores' && rankings.isLoading) {
      setPageContent(<LoadingPage />)
    }
    if (selectedTabID === 'scores') {
      setPageContent(
        <>
          {slider}
          <EuiSpacer />
          {scoreChart}
        </>
      )
    }
  }, [
    rankings.isLoading,
    rankings.currentRankings.scores,
    scoreChart,
    selectedTabID,
    slider
  ])

  React.useEffect(() => {
    if (selectedTabID === 'compare') {
      setPageContent(<ComparePage inst={inst} />)
    }
  }, [inst, selectedTabID])

  const renderTabs = props => {
    return tabs.map((tab, index) => (
      <EuiTab
        {...(tab.href && { href: tab.href, target: '_blank' })}
        onClick={() => onSelectedTabChanged(tab.id)}
        isSelected={tab.id === selectedTabID}
        disabled={tab.disabled}
        key={index}
      >
        {tab.name}
      </EuiTab>
    ))
  }

  if (institutions.error) return <NotFoundPage />
  if (institutions.isLoading || !inst || !instStats) return <LoadingPage />

  return (
    <>
      <Helmet>
        <title>{`${inst.name} - ${c.FRONTEND_NAME}`}</title>
        <meta
          name='description'
          content={
            `${inst.name}'s profile, containing its performance in ` +
            'different ranking systems'
          }
        />
        <meta
          property='og:title'
          content={`${inst.name} - ${c.FRONTEND_NAME}`}
        />
        <link
          rel='canonical'
          href={formatURL(`${r.institutions.url}/${inst.grid_id}`, [], false)}
        />
      </Helmet>
      <EuiPage>
        <EuiPageBody component='section'>
          <InstitutionPageHeader
            institution={inst}
            overview={wiki.currentWikiPage}
            rightSideItems={instStats}
          />
          <EuiTabs
            style={{
              maxWidth: '1200px',
              marginLeft: width >= 1200 ? (width - 1200 - 40) / 2 : 0
            }}
            size='l'
          >
            {renderTabs()}
          </EuiTabs>
          <EuiPageContent borderRadius='none' hasShadow={false}>
            <EuiPageContentBody restrictWidth='1200px'>
              {pageContent}
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    </>
  )
}

const mapStateToProps = state => ({
  state: {
    institutions: {
      isLoading: state.institutions.isLoading,
      currentInstitutions: state.institutions.currentInstitutions,
      selectedInstitutions: state.institutions.selectedInstitutions,
      error: state.institutions.error
    },
    rankings: {
      isLoading: state.rankings.isLoading,
      currentRankings: state.rankings.currentRankings,
      error: state.rankings.error
    },
    wiki: {
      isLoading: state.wiki.isLoading,
      currentWikiPage: state.wiki.currentWikiPage,
      error: state.wiki.error
    }
  }
})
const mapDispatchToProps = {
  getInstitutionByID: institutionActions.getInstitutionByID,
  clearCurrentInstitutions: institutionActions.clearCurrentInstitutions,
  getRanksByInstitutionID: rankingActions.getRanksByInstitutionID,
  getScoresByInstitutionID: rankingActions.getScoresByInstitutionID,
  clearCurrentRankings: rankingActions.clearCurrentRankings,
  getWikiPage: wikiActions.getWikiPage,
  clearCurrentWikiPage: wikiActions.clearCurrentWikiPage
}
export default connect(mapStateToProps, mapDispatchToProps)(InstitutionPage)
