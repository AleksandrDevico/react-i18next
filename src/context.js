import React, { Component } from 'react';
import createReactContext from 'create-react-context';

let defaultOptions = {
  wait: false,
  withRef: false,
  bindI18n: 'languageChanged loaded',
  bindStore: 'added removed',
  translateFuncName: 't',
  nsMode: 'default',
  usePureComponent: false,
  omitBoundRerender: true,
};

let i18nInstance;

export function setDefaults(options) {
  defaultOptions = { ...defaultOptions, ...options };
}

export function getDefaults() {
  return defaultOptions;
}

export function setI18n(instance) {
  i18nInstance = instance;
}

export function getI18n() {
  return i18nInstance;
}

export const reactI18nextModule = {
  type: '3rdParty',

  init(instance) {
    setDefaults(instance.options.react);
    setI18n(instance);
  },
};

export const I18nContext = createReactContext();

// hoc for context
export function withI18n() {
  return function Wrapper(WrappedComponent) {
    class WithContext extends Component {
      constructor(props, context) {
        super(props, context);

        this.getWrappedInstance = this.getWrappedInstance.bind(this);
      }

      getWrappedInstance() {
        return this.wrapped;
      }

      render() {
        // extra props like ref
        const extraProps = {
          ref: c => {
            this.wrapped = c;
          },
        };

        let i18nOptions = this.props.i18nOptions;

        // as default we add i18n, basic t function and i18nOptions from setI18n
        // those get overridden by values passed by I18nContext.Provider <- eg. set in I18nextProvider
        const i18n = this.props.i18n || getI18n();

        if (!i18nOptions) {
          const possibleI18nOptionsFromProps = Object.keys(defaultOptions).reduce((mem, k) => {
            if (this.props[k]) mem[k] = this.props[k];
            return mem;
          }, {});
          i18nOptions = {
            ...getDefaults(),
            ...(i18n && i18n.options && i18n.options.react),
            ...possibleI18nOptionsFromProps,
          };
        }

        if (i18n) {
          extraProps.i18n = i18n;
          extraProps.t = i18n.t.bind(i18n);
          extraProps.lng = i18n.language;
          extraProps.i18nOptions = i18nOptions;
        }

        return React.createElement(I18nContext.Consumer, null, ctx =>
          React.createElement(WrappedComponent, {
            ...extraProps,
            ...ctx,
            ...this.props,
          })
        );
      }
    }

    return WithContext;
  };
}
