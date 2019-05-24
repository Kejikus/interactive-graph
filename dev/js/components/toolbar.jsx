import React, {Component} from 'react';

import M from "materialize-css";

export default class Toolbar extends Component {

	constructor(props) {
		super(props);
		this.state = {
			buttons: props.buttons,
			fields: [],
			message: '',
			setFocusRef: null
		};
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		M.updateTextFields();
		if (this.state.setFocusRef !== null && this.state.setFocusRef.current) {
			this.state.setFocusRef.current.focus();
			this.state.setFocusRef = null;
		}
	}

	addField(type, name, label = '', placeholder = '', focus = false) {
		let ref = React.createRef();
		this.state.fields.push({
			type: type,
			name: name,
			label: label,
			placeholder: placeholder,
			ref: ref
		});
		if (focus) {
			this.state.setFocusRef = ref;
		}
		this.forceUpdate();
		return ref;
	}

	removeField(i) {
		this.state.fields = this.state.fields.filter((_, index) => index !== i);
		this.forceUpdate();
	}

	removeAllFields() {
		this.state.fields = [];
		this.forceUpdate();
	}

	addButton(label, onClick, className) {
		let ref = React.createRef();
		this.state.buttons.push({
			value: label,
			onClick: onClick,
			className: className,
			ref: ref
		});
		this.forceUpdate();
		return ref;
	}

	removeButton(i) {
		this.buttons = this.state.buttons.filter((_, index) => index !== i);
		this.forceUpdate();
	}

	removeAllButtons() {
		this.buttons = [];
		this.forceUpdate();
	}

	showMessage(msg) {
		this.setState({message: msg});
	}

	render() {

		const buttons = this.state.buttons.map((button, index) => {
			return (
				<button key={ index }
				        ref={ button.ref }
				        className="btn waves-effect waves-light"
				        onClick={ button.onClick }>
					{ button.value }
				</button>
			);
		});

		const inputFields = this.state.fields.map((field, index) => {
			if (['checkbox', 'radio'].includes(field.type)) {
				return (
					<label key={index}>
						<input ref={field.ref}
						       type={field.type}
						       name={field.name}/>
						<span>{field.label}</span>
					</label>
				);
			} else {
				return (
					<div key={index} className="input-field">
						<input ref={field.ref}
						       type={field.type}
						       name={field.name}
						       placeholder={field.placeholder}/>
						<label>{field.label}</label>
					</div>
				);
			}
		});

		const { message } = this.state;

		return (
			<div className={ this.props.className }>
				<div className="buttons">{ buttons }</div>
				<div className="fields">{ inputFields }</div>
				<div className="message">{ message }</div>
			</div>
		);
	}
}
