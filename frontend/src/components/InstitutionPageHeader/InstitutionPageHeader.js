import {
  EuiPanel,
  EuiFlexGroup,
  EuiFlexItem,
  EuiIcon,
  EuiLink,
  EuiText,
  EuiToolTip,
  EuiPageHeader
} from '@elastic/eui'

import { InstitutionLogo } from '..'
import {
  gridDisabled,
  gridInverse,
  homeDisabled,
  homeFill,
  locationOutline,
  wikipediaDisabled,
  wikipediaInverse
} from '../../assets/images'
import * as c from '../../config'
import { gridURL, openStreetMapURL } from '../../utils'

const PageHeader = props => {
  const { institution: inst, overview, rightSideItems } = props
  const renderLocation = (country, city, lat, lng) => {
    const url = openStreetMapURL(lat, lng)
    return (
      <EuiLink href={url} disabled={!url} target='_blank' external={false}>
        <EuiIcon type={locationOutline} size='l' />
        {city}, {country.country}
      </EuiLink>
    )
  }

  const renderLinks = links => {
    const linkTypes = {
      homepage: {
        alias: 'Hompage',
        icon: homeFill,
        iconDisabled: homeDisabled
      },
      grid: {
        alias: 'GRID profile',
        icon: gridInverse,
        iconDisabled: gridDisabled
      },
      wikipedia: {
        alias: 'Wikipedia page',
        icon: wikipediaInverse,
        iconDisabled: wikipediaDisabled
      },
      ...c.rankingSystems
    }
    links = Object.assign({}, ...links.map(i => ({ [i.type]: i.link })))
    links.grid = gridURL(inst.grid_id)
    const linkElements = Object.keys(linkTypes).map(i => {
      let tooltipContent = linkTypes[i].alias
      if (Object.keys(c.rankingSystems).includes(i)) {
        tooltipContent = tooltipContent.concat(' ranking profile')
      }
      return (
        <EuiToolTip content={tooltipContent} key={i} position='top'>
          <EuiLink
            href={links[i]}
            disabled={!links[i]}
            target='_blank'
            external={false}
          >
            <EuiIcon
              type={links[i] ? linkTypes[i].icon : linkTypes[i].iconDisabled}
              size='l'
              title={tooltipContent.concat(' icon')}
              aria-label={tooltipContent.concat(' icon')}
            />
          </EuiLink>
        </EuiToolTip>
      )
    })
    linkElements.push(
      renderLocation(inst.country, inst.city, inst.lat, inst.lng)
    )
    return linkElements
  }

  return (
    <EuiPageHeader restrictWidth='1200px'>
      <div>
        <EuiFlexGroup justifyContent='spaceBetween'>
          <EuiFlexItem>
            <EuiFlexGroup>
              <EuiFlexItem grow={false} style={{ maxWidth: '112px' }}>
                <EuiPanel paddingSize='s' grow={false}>
                  <InstitutionLogo
                    alt={`${inst.name} logo`}
                    institution={inst}
                    size='96px'
                  />
                </EuiPanel>
              </EuiFlexItem>
              <EuiFlexItem grow={false}>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false}>
                    <EuiText>
                      <h1>{inst.name}</h1>
                    </EuiText>
                    <EuiText size='xs'>since {inst.established}</EuiText>
                  </EuiFlexItem>
                </EuiFlexGroup>
                <EuiFlexGroup>
                  <EuiFlexItem grow={false} style={{}}>
                    <EuiFlexGroup>
                      {renderLinks(inst.links).map((item, index) => (
                        <EuiFlexItem key={index} grow={false}>
                          {item}
                        </EuiFlexItem>
                      ))}
                    </EuiFlexGroup>
                  </EuiFlexItem>
                </EuiFlexGroup>
              </EuiFlexItem>
            </EuiFlexGroup>
          </EuiFlexItem>
          <EuiFlexItem grow={1} style={{ maxWidth: '250px' }}>
            <EuiFlexGroup wrap>
              {rightSideItems.map((item, index) => (
                <EuiFlexItem grow={false} key={index}>
                  {item}
                </EuiFlexItem>
              ))}
            </EuiFlexGroup>
          </EuiFlexItem>
        </EuiFlexGroup>
        <EuiFlexGroup>
          <EuiFlexItem>
            <EuiText>{overview}</EuiText>
          </EuiFlexItem>
        </EuiFlexGroup>
      </div>
    </EuiPageHeader>
  )
}

export default PageHeader
