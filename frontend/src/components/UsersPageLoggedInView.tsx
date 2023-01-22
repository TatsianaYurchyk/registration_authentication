import { useEffect, useState } from "react";
import { Button} from "react-bootstrap";
import { FaTrashAlt } from "react-icons/fa";
import { UserNote } from "../models/userNote";
import * as UsersApi from "../network/users_api";
import Table from "react-bootstrap/Table";
import { formatDate } from "../utils/formatDate";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import { FaLockOpen } from "react-icons/fa";
import { User } from "../models/user";

interface UsersPageProps {
	loggedInUser: User;
}

const UsersPageLoggedInView = ({ loggedInUser }: UsersPageProps) => {
	const [users, setUsers] = useState<UserNote[]>([]);
	const [isCheck, setIsCheck] = useState<UserNote[]>([]);
	const [isCheckAll, setIsCheckAll] = useState(false);
	const [isClick, setIsClick] = useState(false);

	useEffect(() => {
		async function loadUsers() {
			try {
				const users = await UsersApi.fetchUsers();
				setUsers(users);
			} catch (error) {
				console.error(error);
			}
		}
		loadUsers();
	}, []);


	// Checkbox handle start

	const toggleCheckbox = (
		e: React.ChangeEvent<HTMLInputElement>,
		item: any
	) => {
		const {name, checked} = e.target;
		let tempUser = isCheck.find((user) => user.username === name);
		// item.isChecked=!item.isChecked;
		if (tempUser) {
			isCheck.splice(isCheck.indexOf(item), 1);
		} else {
			let newCheckedUsers = isCheck;
			newCheckedUsers.push(item);
			setIsCheck(newCheckedUsers);
		}
		console.log(isCheck);
	};

	const handleAllChecked = () => {
		setIsCheckAll((prev) => !prev);
	};
	const handleAllCheckedFull = () => {
		if (isCheckAll) {
			users.forEach((user) => (user.isChecked = true));
			setIsCheck(users);

		} else {
			setIsCheck([]);
			users.forEach((user) => (user.isChecked = false));
		}
		console.log(isCheckAll)
		console.log(isCheck)
	};

	useEffect(() => {
		handleAllCheckedFull();
	}, 	[isCheckAll]);

	// Checkbox handle end

	async function deleteUser(user: UserNote) {
		try {
			await UsersApi.deleteUser(user._id);
			setUsers(
				users.filter((existingUser) => existingUser._id !== user._id)
			);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}

	const deleteAll = () => {
		isCheck.map((item) => deleteUser(item));
		setIsCheck([])
        loadUsers()
	};

	async function loadUsers() {
		try {
			const users = await UsersApi.fetchUsers();
			setUsers(users);
			console.log("loadnotes");
		} catch (error) {
			console.error(error);
		}
	}

	async function logout() {
		try {
			await UsersApi.logout();
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}

	async function blockStatus(user: UserNote) {
		try {
			await UsersApi.blockStatus(user._id);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}
	const blockStatusAll = () => {
		isCheck.map((item) => blockStatus(item));
		setIsClick((prev) => !prev);
		loadUsers();
		console.log(isCheck);
	};

	const dropUser =()=>{
		isCheck.find((item) =>
			item.username === loggedInUser.username
				? logout()
				: console.log("you're still active")
		);
	}

	useEffect(() => {
		dropUser()
	}, [isClick]);

	async function activateStatus(user: UserNote) {
		try {
			await UsersApi.activateStatus(user._id);
		} catch (error) {
			console.error(error);
			alert(error);
		}
	}
	const activateStatusAll = () => {
		isCheck.map((item) => activateStatus(item));
		loadUsers()
	};

	
    const usersGrid = (
		<>
			{users.map((user) => (
				<tr key={user._id}>
					<td>
						<input
							type="checkbox"
							name={user.username}
							id={user._id}
							checked={user.isChecked}
							onChange={(e) => toggleCheckbox(e, user)}
						/>
					</td>
					<td>{user._id}</td>
					<td>{user.username}</td>
					<td>{user.email}</td>
					<td>{formatDate(user.createdAt)}</td>
					<td>{user.status}</td>
				</tr>
			))}
		</>
	);


	return (
		<>
			{users.length > 0 ? (
				<>
					<ButtonGroup aria-label="Basic example" className="mb-3 width100">
						<Button variant="danger" onClick={blockStatusAll}>
							Block
						</Button>
						<Button variant="secondary" onClick={activateStatusAll}>
							<FaLockOpen />
						</Button>
						<Button variant="secondary" onClick={deleteAll}>
							<FaTrashAlt />
						</Button>
					</ButtonGroup>
					<Table striped bordered hover>
						<thead>
							<tr>
								<th>
									<input
										type="checkbox"
										name="selectAll"
										onChange={handleAllChecked}
									/>
								</th>
								<th>id</th>
								<th>username</th>
								<th>email</th>
								<th>SignUp time</th>
								<th>status</th>
							</tr>
						</thead>
						<tbody>{usersGrid}</tbody>
					</Table>
				</>
			) : (
				<p>Wait,there is nothing to see... </p>
			)}
		</>
	);
};

export default UsersPageLoggedInView;
