import React from 'react';
import { Panel, Table, Button, Modal, FormGroup, ControlLabel, Form, Col, FormControl, Tooltip, OverlayTrigger } from 'react-bootstrap';
import Select from 'react-select';
import UsersFetcher from '../components/fetchers/UsersFetcher';
import AdminFetcher from '../components/fetchers/AdminFetcher';
import MessagesFetcher from '../components/fetchers/MessagesFetcher';

const loadUserByName = (input) => {
  if (!input) {
    return Promise.resolve({ options: [] });
  }

  return UsersFetcher.fetchUsersByName(input)
    .then((res) => {
      const usersEntries = res.users.filter(u => u.user_type === 'Person')
        .map(u => ({
          value: u.id,
          name: u.name,
          label: `${u.name}(${u.abb})`
        }));
      return { options: usersEntries };
    }).catch((errorMessage) => {
      console.log(errorMessage);
    });
};

const handleResetPassword = (id) => {
  AdminFetcher.resetUserPassword({ user_id: id })
    .then((result) => {
      if (result.rp) {
        const message = result.pwd ? `Password Reset! New Password: ${result.pwd}`
          : 'Password Reset!';
        alert(message);
      }
    });
};

const validateEmail = mail => (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(mail));

const resetPasswordTooltip = () => (
  <Tooltip id="assign_button">reset user password</Tooltip>
);
const confirmUserTooltip = () => (
  <Tooltip id="assign_button">confirm user account</Tooltip>
);

export default class UserManagement extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      users: [],
      selectedUsers: null,
      showMsgModal: false,
      showNewUserModal: false,
      createUserMessage: ''
    };
    this.handleFetchUsers = this.handleFetchUsers.bind(this);
    this.handleMsgShow = this.handleMsgShow.bind(this);
    this.handleMsgClose = this.handleMsgClose.bind(this);
    this.handleNewUserShow = this.handleNewUserShow.bind(this);
    this.handleNewUserClose = this.handleNewUserClose.bind(this);
    this.handleSelectUser = this.handleSelectUser.bind(this);
    this.messageSend = this.messageSend.bind(this);
    this.handleCreateNewUser = this.handleCreateNewUser.bind(this);
  }

  componentDidMount() {
    this.handleFetchUsers();
    return true;
  }

  componentWillUnmount() {
  }

  handleMsgShow() {
    this.setState({
      showMsgModal: true
    });
  }

  handleMsgClose() {
    this.setState({
      showMsgModal: false
    });
  }

  handleNewUserShow() {
    this.setState({
      showNewUserModal: true
    });
  }

  handleNewUserClose() {
    this.setState({
      showNewUserModal: false
    });
  }

  handleFetchUsers() {
    AdminFetcher.fetchUsers()
      .then((result) => {
        this.setState({
          users: result.users
        });
      });
  }

  handleSelectUser(val) {
    if (val) {
      this.setState({ selectedUsers: val });
    }
  }

  handleConfirmUserAccount(id) {
    AdminFetcher.confirmUserAccount({ user_id: id })
      .then((result) => {
        if (result !== null) {
          this.handleFetchUsers();
          alert('User Account Confirmed!');
        }
      });
  }

  validateUserInput() {
    if (this.email.value === '') {
      this.setState({ createUserMessage: 'please input email.' });
      return false;
    } else if (!validateEmail(this.email.value.trim())) {
      this.setState({ createUserMessage: 'You have entered an invalid email address!' });
      return false;
    } else if (this.password.value.trim() === '' || this.passwordConfirm.value.trim() === '') {
      this.setState({ createUserMessage: 'please input password with correct format.' });
      return false;
    } else if (this.password.value.trim() !== this.passwordConfirm.value.trim()) {
      this.setState({ createUserMessage: 'password do not mach!' });
      return false;
    } else if (this.password.value.trim().length < 2) {
      this.setState({ createUserMessage: 'Password is too short (minimum is 8 characters)' });
      return false;
    } else if (this.firstname.value.trim() === '' || this.lastname.value.trim() === '' || this.nameAbbr.value.trim() === '') {
      this.setState({ createUserMessage: 'please input First name, Last name and Name abbreviation' });
      return false;
    }
    return true;
  }

  handleCreateNewUser() {
    if (!this.validateUserInput()) {
      return false;
    }
    AdminFetcher.createUserAccount({
      email: this.email.value.trim(),
      password: this.password.value.trim(),
      first_name: this.firstname.value.trim(),
      last_name: this.lastname.value.trim(),
      name_abbreviation: this.nameAbbr.value.trim(),
      type: this.type.value
    })
      .then((result) => {
        if (result.error) {
          this.setState({ createUserMessage: result.error });
          return false;
        }
        this.setState({ createUserMessage: 'New user created.' });
        this.email.value = '';
        this.password.value = '';
        this.passwordConfirm.value = '';
        this.firstname.value = '';
        this.lastname.value = '';
        this.nameAbbr.value = '';
        this.handleFetchUsers();
        return true;
      });
    return true;
  }

  messageSend() {
    const { selectedUsers } = this.state;
    if (this.myMessage.value === '') {
      alert('Please input the message!');
    } else if (!selectedUsers) {
      alert('Please select user(s)!');
    } else {
      const userIds = [];
      selectedUsers.map((g) => {
        userIds.push(g.value);
        return true;
      });
      MessagesFetcher.channelIndividualUsers()
        .then((result) => {
          const params = {
            channel_id: result.id,
            content: this.myMessage.value,
            user_ids: userIds
          };
          MessagesFetcher.createMessage(params)
            .then((result) => {
              this.myMessage.value = '';
              this.setState({
                selectedUsers: null
              });
              this.handleMsgClose();
            });
        });
    }
  }

  renderMessageModal() {
    const { selectedUsers } = this.state;
    return (
      <Modal
        show={this.state.showMsgModal}
        onHide={this.handleMsgClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>Send Message</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto' }}>
          <div className="col-md-9">
            <Form>
              <FormGroup controlId="formControlsTextarea">
                <ControlLabel>Message</ControlLabel>
                <FormControl
                  componentClass="textarea"
                  placeholder="message..."
                  rows="20"
                  inputRef={(ref) => { this.myMessage = ref; }}
                />
              </FormGroup>
              <FormGroup>
                <Select.AsyncCreatable
                  multi
                  isLoading
                  backspaceRemoves
                  value={selectedUsers}
                  valueKey="value"
                  labelKey="label"
                  matchProp="name"
                  placeholder="Select users"
                  promptTextCreator={this.promptTextCreator}
                  loadOptions={loadUserByName}
                  onChange={this.handleSelectUser}
                />
              </FormGroup>
              <Button
                bsStyle="primary"
                onClick={() => this.messageSend()}
              >
                Send&nbsp;
                <i className="fa fa-paper-plane" />
              </Button>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  renderNewUserModal() {
    // const { selectedUsers } = this.state;
    return (
      <Modal
        show={this.state.showNewUserModal}
        onHide={this.handleNewUserClose}
      >
        <Modal.Header closeButton>
          <Modal.Title>New User</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ overflow: 'auto' }}>
          <div className="col-md-9">
            <Form horizontal>
              <FormGroup controlId="formControlEmail">
                <Col componentClass={ControlLabel} sm={3}>
                  Email:
                </Col>
                <Col sm={9}>
                  <FormControl type="email" name="email" inputRef={(ref) => { this.email = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlPassword">
                <Col componentClass={ControlLabel} sm={3}>
                  Password:
                </Col>
                <Col sm={9}>
                  <FormControl type="password" name="password" inputRef={(ref) => { this.password = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlPasswordConfirmation">
                <Col componentClass={ControlLabel} sm={3}>
                  Password Confirmation:
                </Col>
                <Col sm={9}>
                  <FormControl type="password" inputRef={(ref) => { this.passwordConfirm = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlFirstName">
                <Col componentClass={ControlLabel} sm={3}>
                  First name:
                </Col>
                <Col sm={9}>
                  <FormControl type="text" name="firstname" inputRef={(ref) => { this.firstname = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlLastName">
                <Col componentClass={ControlLabel} sm={3}>
                  Last name:
                </Col>
                <Col sm={9}>
                  <FormControl type="text" name="lastname" inputRef={(ref) => { this.lastname = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlAbbr">
                <Col componentClass={ControlLabel} sm={3}>
                  Abbr (3) *:
                </Col>
                <Col sm={9}>
                  <FormControl type="text" name="nameAbbr" inputRef={(ref) => { this.nameAbbr = ref; }} />
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlsType">
                <Col componentClass={ControlLabel} sm={3}>
                  Type:
                </Col>
                <Col sm={9}>
                  <FormControl componentClass="select" inputRef={(ref) => { this.type = ref; }} >
                    <option value="Person">Person</option>
                    <option value="Admin">Admin</option>
                    <option value="Device">Device</option>
                  </FormControl>
                </Col>
              </FormGroup>
              <FormGroup controlId="formControlMessage">
                <Col sm={12}>
                  <FormControl type="text" readOnly name="createUserMessage" value={this.state.createUserMessage} />
                </Col>
              </FormGroup>
              <FormGroup>
                <Col smOffset={0} sm={10}>
                  <Button bsStyle="primary" onClick={() => this.handleCreateNewUser()} >
                    Create&nbsp;
                    <i className="fa fa-plus" />
                  </Button>
                  &nbsp;
                  <Button bsStyle="warning" onClick={() => this.handleNewUserClose()} >
                    Cancel&nbsp;
                  </Button>
                </Col>
              </FormGroup>
            </Form>
          </div>
        </Modal.Body>
      </Modal>
    );
  }

  render() {
    const renderConfirmButton = (show, userId) => {
      if (show) {
        return (
          <OverlayTrigger placement="bottom" overlay={confirmUserTooltip()}>
            <Button
              bsSize="xsmall"
              bsStyle="primary"
              onClick={() => this.handleConfirmUserAccount(userId, false)}
            >
              <i className="fa fa-check-square" />
            </Button>
          </OverlayTrigger>
        )
      }
      return <div />
    }

    const { users } = this.state;

    const tcolumn = (
      <tr style={{ height: '26px', verticalAlign: 'middle' }}>
        <th width="1%">#</th>
        <th width="5%" />
        <th width="15%">Name</th>
        <th width="6%">Abbr.</th>
        <th width="10%">Email</th>
        <th width="7%">Type</th>
        <th width="15%">Login at</th>
        <th width="2%">ID</th>
      </tr>
    )

    const tbody = users.map((g, idx) => (
      <tr key={`row_${g.id}`} style={{ height: '26px', verticalAlign: 'middle' }}>
        <td width="1%">
          {idx + 1}
        </td>
        <td width="5%">
          <OverlayTrigger placement="bottom" overlay={resetPasswordTooltip()} >
            <Button
              bsSize="xsmall"
              bsStyle="danger"
              onClick={() => handleResetPassword(g.id, false)}
            >
              <i className="fa fa-key" />
            </Button>
          </OverlayTrigger>
          &nbsp;
          { renderConfirmButton(g.confirmed_at == null || g.confirmed_at.length <= 0, g.id) }
        </td>
        <td width="15%"> {g.name} </td>
        <td width="6%"> {g.initials} </td>
        <td width="10%"> {g.email} </td>
        <td width="7%"> {g.type} </td>
        <td width="15%"> {g.current_sign_in_at} </td>
        <td width="2%"> {g.id} </td>
      </tr>
    ));

    return (
      <div>
        <Panel>
          <Button bsStyle="warning" bsSize="small" onClick={() => this.handleMsgShow()}>
          Send Message&nbsp;<i className="fa fa-commenting-o" />
          </Button>
          &nbsp;
          <Button bsStyle="primary" bsSize="small" onClick={() => this.handleNewUserShow()}>
          New User&nbsp;<i className="fa fa-plus" />
          </Button>
        </Panel>
        <Panel>
          <Table>
            <thead>
              { tcolumn }
            </thead>
            <tbody>
              { tbody }
            </tbody>
          </Table>
        </Panel>
        { this.renderMessageModal() }
        { this.renderNewUserModal() }
      </div>
    );
  }
}
