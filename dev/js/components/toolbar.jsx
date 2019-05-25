import React, {Component} from 'react';

import M from "materialize-css";
import {messager, msgTypes} from "../rendererMessager";

export default class Toolbar extends Component {

	constructor(props) {
		super(props);
		this.state = {
			buttons: props.buttons,
			fields: [],
			message: '',
			setFocusRef: null
		};

		messager.on(msgTypes.toolbarSetMessage, (msg) => this.showMessage(msg));
	}

	componentDidUpdate(prevProps, prevState, snapshot) {
		M.updateTextFields();
		if (this.state.setFocusRef !== null && this.state.setFocusRef.current) {
			this.state.setFocusRef.current.focus();
			this.state.setFocusRef = null;
		}
	}

	addField(options) {
		let ref = React.createRef();
		const defaults = {
			name: '',
			label: '',
			type: 'text',
			placeholder: '',
			ref: ref,
			value: '',
			checked: false,
			onClick: () => undefined,
			onChange: () => undefined,
			focus: false,
			min: undefined
		};
		let resOptions = {};
		Object.assign(resOptions, defaults, options);
		this.state.fields.push(resOptions);
		if (resOptions.focus) {
			this.state.setFocusRef = resOptions.ref;
		}
		this.forceUpdate();
		return resOptions.ref;
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
		if (i >= 0)
			this.state.buttons = this.state.buttons.filter((_, index) => index !== i);
		else {
			const length = this.state.buttons.length;
			this.state.buttons = this.state.buttons.filter((_, index) => index !== length + i);
		}
		this.forceUpdate();
	}

	removeAllButtons() {
		this.state.buttons = [];
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
						       name={field.name}
						       onChange={field.onChange}
						       defaultChecked={field.checked}/>
						<span>{field.label}</span>
					</label>
				);
			} else if (field.type === 'button') {
				return (
					<input key={index} className="btn waves-effect waves-light" type="button"
					       value={field.value} name={field.name} ref={field.ref} onClick={field.onClick}/>
				);
			} else {
				return (
					<div key={index} className="input-field">
						<input ref={field.ref}
						       type={field.type}
						       name={field.name}
						       placeholder={field.placeholder}
						       defaultValue={field.value}
						       min={field.min}
						       onChange={field.onChange}/>
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
