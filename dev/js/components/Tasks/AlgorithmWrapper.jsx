import React from 'react';

export default class AlgorithmWrapper extends React.Component {
	render() {
		const { children, visible } = this.props;
		return(
			<div className={`algorithm-wrapper ${visible ? '' : 'hidden'}`}>
				{children}
			</div>
		);
	}
}
