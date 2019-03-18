import { ME_QUERY } from '../../graphql'

export const checkLoggedIn = apolloClient =>
	apolloClient
		.query({
			query: ME_QUERY
		})
		.then(({ data }) => {
			return data
		})
		.catch(err => {
			console.log(err)
			// Fail gracefully
			return { me: {} }
		})
