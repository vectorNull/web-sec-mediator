import React, { Fragment, useEffect } from 'react';
import propTypes from 'prop-types';
import Spinner from '../layout/spinner';
import { connect } from 'react-redux';
import { getProfiles } from '../../actions/profiles';
import ProfileItem from './ProfileItem';

const Profiles = ({ getProfiles, profile: { profiles, loading } }) => {
	useEffect(() => {
		getProfiles();
	}, [getProfiles]);

	return (
		<Fragment>
			{loading ? (
				<Spinner />
			) : (
				<Fragment>
					<h1 className='large text-primary'>WebSec Profiles</h1>
					<p className='lead'>
						<i className='fab fa-connectdevelop'></i> Browse and
						connect with WebSec Professionals
					</p>
					<div className='profiles'>
						{profiles.length > 0 ? (
							profiles.map((profile) => (
								<ProfileItem
									key={profile._id}
									profile={profile}
								/>
							))
						) : (
							<h4>No Profiles found...</h4>
						)}
					</div>
				</Fragment>
			)}
		</Fragment>
	);
};

Profiles.propTypes = {
	getProfiles: propTypes.func.isRequired,
	profile: propTypes.object.isRequired,
};

const mapStateToProps = (state) => ({
	profile: state.profile,
});

export default connect(mapStateToProps, { getProfiles })(Profiles);
