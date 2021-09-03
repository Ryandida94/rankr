import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import {
  AboutPage,
  InstitutionsRouter,
  LandingPage,
  Layout,
  NotFoundPage
} from '../../components'
import { r } from '../../routes'

const App = () => {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path={r.home.url} element={<LandingPage />} />
          <Route
            path={`${r.institutions.url}/*`}
            element={<InstitutionsRouter />}
          />
          <Route path={r.about.url} element={<AboutPage />} />
          <Route path={r.notFoundPage.url} element={<NotFoundPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App