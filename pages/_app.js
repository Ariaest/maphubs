import App, { Container } from 'next/app'
import Head from 'next/head'
import React from 'react'

export default class MapHubs extends App {
  static async getInitialProps ({ Component, ctx }) {
    let pageProps = {}

    if (Component.getInitialProps) {
      pageProps = await Component.getInitialProps(ctx)
    }

    return { pageProps }
  }

  render () {
    const { Component, pageProps } = this.props

    return (
      <Container>
        <Head>
          <title>{this.props.router.query.title || 'MapHubs'}</title>
        </Head>
        <Component {...pageProps} />
      </Container>
    )
  }
}