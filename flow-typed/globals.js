import type ReactComponent from 'react'

declare var Raven: Object;
declare var Auth0Lock: Class<Object>;
declare var M: Object;
declare var Coral: Object;

type JSXHelper<T> = Class<ReactComponent<T, T, mixed>>;

type $JSXIntrinsics = {
  div: JSXHelper<{id: string, lang: string, className: string, style: Object}>,
  p: JSXHelper<{id: string, lang: string, className: string, style: Object}>,
  b: JSXHelper<{id: string, style: Object}>,
  span: JSXHelper<{id: string, style: Object}>,
  header: JSXHelper<{id: string, style: Object}>,
  nav: JSXHelper<{id: string, style: Object}>,
  footer: JSXHelper<{id: string, style: Object}>,
  small: JSXHelper<{id: string, style: Object}>,
  a: JSXHelper<{href: string, style: Object}>,
  h1: JSXHelper<{className: string, style: Object}>,
  h2: JSXHelper<{className: string, style: Object}>,
  h3: JSXHelper<{className: string, style: Object}>,
  h4: JSXHelper<{className: string, style: Object}>,
  h5: JSXHelper<{className: string, style: Object}>,
  h6: JSXHelper<{className: string, style: Object}>,
  main: JSXHelper<{className: string, style: Object}>,
  i: JSXHelper<{className: string, style: Object}>,
  img: JSXHelper<{className: string, src: string, style: Object}>,
  iframe: JSXHelper<{className: string, src: string, style: Object}>,
  button: JSXHelper<{className: string, type: string, style: Object}>,
  form: JSXHelper<{id: string, style: Object}>,
  input: JSXHelper<{id: string, style: Object}>,
  textarea: JSXHelper<{id: string, style: Object}>,
  label: JSXHelper<{id: string, style: Object}>,
  option: JSXHelper<{id: string, style: Object}>,
  ul: JSXHelper<{id: string, style: Object}>,
  li: JSXHelper<{id: string, style: Object}>,
  ol: JSXHelper<{id: string, style: Object}>,
  table: JSXHelper<{id: string, style: Object}>,
  thead: JSXHelper<{id: string, style: Object}>,
  tbody: JSXHelper<{id: string, style: Object}>,
  tr: JSXHelper<{id: string, style: Object}>,
  th: JSXHelper<{id: string, style: Object}>,
  td: JSXHelper<{id: string, style: Object}>,
  br: JSXHelper<{id: string, style: Object}>,
  hr: JSXHelper<{id: string, style: Object}>,
  svg: JSXHelper<{baseProfile: string, xmlns: string, width: number, height: number, viewBox: string}>,
  path: JSXHelper<{d: string}>,
  circle: JSXHelper<{id: string}>,
    g: JSXHelper<{id: string}>,
  use: JSXHelper<{xlinkHref: string}>,
  polygon: JSXHelper<{points: string}>,
  rect: JSXHelper<{x: number, y: number, width: number, height: number}>,
  style: JSXHelper<{jsx: boolean, global: boolean}>,
  code: JSXHelper<{id: string}>,
  script: JSXHelper<{id: string}>
};

declare type NestedArray<T> = Array<T | NestedArray<T>>

declare module 'uuid/v4' {
  declare module.exports: any;
}

declare type LocalizedString = {
  en?: string,
  fr?: string,
  it?: string,
  es?: string
}
