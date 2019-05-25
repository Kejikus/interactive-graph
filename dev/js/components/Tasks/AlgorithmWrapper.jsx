import React from 'react';

export default class AlgorithmWrapper extends React.Component {
	render() {
		const { children } = this.props;
		return(
			<div className='algorithm-wrapper'>
				{children}
			</div>
		);
	}
}
