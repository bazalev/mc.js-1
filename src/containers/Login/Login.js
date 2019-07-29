/**
 * LOGIN PAGE
 * - REPRESENTS: LAUNCHER LOGIN
 */

import { LOGIN_MUTATION, LOGIN_SCHEMA } from '../../lib/graphql'
import { setCookie, removeAllCookies } from '../../lib/utils'
import withAuthGuard from '../../hoc/AuthGuard/AuthGuard'
import { Hint } from '../../components/Utils'
import logo from '../../assets/gui/MinecraftJS_login.png'

import classes from './Login.module.css'

import { Formik } from 'formik'
import { withRouter, Redirect } from 'react-router-dom'
import { Mutation, withApollo } from 'react-apollo'
import React, { useEffect } from 'react'

// TODO Componentize login form

const Login = ({ client, history, isAuth, loading: authHint }) => {
  useEffect(() => {
    document.title = 'MinecraftJS - Login'
  })

  if (isAuth) return <Redirect to="/home" />

  removeAllCookies()

  return (
    <Mutation
      mutation={LOGIN_MUTATION}
      onCompleted={data => {
        setCookie(data.login.token)

        // Force a reload of all current queries now that user is
        // logged in
        client.cache.reset().then(() => {
          history.push('/home')
        })
      }}
      // eslint-disable-next-line no-console
      onError={error => console.error(error)}
    >
      {(login, { error, loading }) => {
        return loading || authHint ? (
          <Hint />
        ) : (
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={LOGIN_SCHEMA}
            onSubmit={(values, { setSubmitting, setErrors }) => {
              login({
                variables: {
                  email: values.email.toLowerCase().trim(),
                  password: values.password
                }
              }).then(
                () => {
                  setSubmitting(false)
                },
                e => {
                  // eslint-disable-next-line no-console
                  console.error(e.graphQLErrors)
                  setSubmitting(false)
                  setErrors({ email: 'Wrong Credentials.', password: '' })
                }
              )
            }}
            render={({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting
            }) => (
              <form onSubmit={handleSubmit} className={classes.wrapper}>
                <img src={logo} alt="MinecraftJS" className={classes.logo} />
                <div className={classes.inputFields}>
                  <div className={classes.inputField}>
                    <h1>Email</h1>
                    <div className={classes.wrappedInputField}>
                      <input
                        id="email"
                        name="email"
                        value={values.email}
                        label="email"
                        type="email"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Email"
                      />
                      <span>
                        {(touched.email && errors.email ? errors.email : '') ||
                          (error ? 'Wrong credentials.' : '')}
                      </span>
                    </div>
                  </div>

                  <div className={classes.inputField}>
                    <h1>Password</h1>
                    <div className={classes.wrappedInputField}>
                      <input
                        id="password"
                        name="password"
                        value={values.password}
                        type="password"
                        autoComplete="current-password"
                        label="password"
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="Password"
                      />
                      <span>{touched.password && !!errors.password ? errors.password : ''}</span>
                    </div>
                  </div>

                  <div className={classes.navigations}>
                    <button
                      type="button"
                      className={classes.needAccount}
                      onClick={() => history.push('/register')}
                    >
                      Need account?
                    </button>
                    <button
                      type="submit"
                      disabled={
                        !values.email ||
                        !values.password ||
                        isSubmitting ||
                        !!(errors.email && touched.email) ||
                        !!(errors.password && touched.password)
                      }
                    >
                      Login
                    </button>
                  </div>
                </div>
              </form>
            )}
          />
        )
      }}
    </Mutation>
  )
}

export default withAuthGuard(withRouter(withApollo(Login)))
