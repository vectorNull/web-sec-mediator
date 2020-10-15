import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import propType from 'prop-types';

const Landing = ({ isAuthenticated }) => {
	if (isAuthenticated) {
		return <Redirect to='/dashboard' />;
	}

	return (
		<section className='landing'>
			<div className='dark-overlay'>
				<div className='landing-inner'>
					<h1 className='x-large'>WebSec Mediator</h1>
					<p className='lead'>
						Hackers, Pentester, Bug Hunters . . . Welcome to the
						conversation!
					</p>
					<div className='buttons'>
						<Link to='/register' className='btn btn-primary'>
							Sign Up
						</Link>
						<Link to='/login' className='btn btn-light'>
							Login
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
};

Landing.propType = {
	isAuthenticated: propType.bool,
};

const mapStateToProp = (state) => ({
	isAuthenticated: state.auth.isAuthenticated,
});

export default connect(mapStateToProp)(Landing);
