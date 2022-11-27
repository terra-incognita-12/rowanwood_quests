import { useLocation, useNavigate } from "react-router-dom"
import { useState } from "react"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import ErrMsg from "../ErrMsg"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const CreateQuestForm = () => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

	const [name, setName] = useState("")
	const [briefDesc, setBriefDesc] = useState("")
	const [fullDesc, setFullDesc] = useState("")
	const [url, setUrl] = useState("")
	const [telegramUrl, setTelegramUrl] = useState("")
	const [photo, setPhoto] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		try {
			const response = await axiosPrivate.post("/quest/create", JSON.stringify({"name": name, "url": url, "telegram_url": telegramUrl, "brief_description": briefDesc, "full_description": fullDesc, "photo": photo}))

			navigate("/editor/edit", { replace: true})
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 403) {
				setErrMsg("Quest with this url already exists")
			} else {
                setErrMsg("Create Quest Failed")
            }
            handleShowErr(true)
		}
	}

	return (
		<>
			{showErrMsg 
				?
				<ErrMsg msg={errMsg} handleShowErr={handleShowErr} />
			    : null
			}
			<Form onSubmit={handleSubmit}>
				<Row className="mt-5">
					<Col xs={12} lg={6}>
						<Form.Group className="mb-1">
							<Form.Label htmlFor="name">Quest Name</Form.Label>
							<Form.Control 
								type="text"
								id="name"
								onChange={(e) => setName(e.target.value)}
								value={name}
								autoComplete="off"
								required
							/>
						</Form.Group>
						<Form.Group className="mb-1">
							<Form.Label htmlFor="name">Photo</Form.Label>
							<Form.Control 
								type="text"
								id="name"
								onChange={(e) => setPhoto(e.target.value)}
								value={photo}
								autoComplete="off"
								required
							/>
						</Form.Group>
					</Col>
					<Col xs={12} lg={6}>
		    			<Form.Group className="mb-1">
							<Form.Label htmlFor="name">Unique Name (for URL)</Form.Label>
							<Form.Control 
								type="text"
								id="name"
								onChange={(e) => setUrl(e.target.value)}
								value={url}
								autoComplete="off"
								required
							/>
						</Form.Group>
						<Form.Group className="mb-1">
							<Form.Label htmlFor="name">Telegram Address Of Quest</Form.Label>
							<Form.Control 
								type="text"
								id="name"
								onChange={(e) => setTelegramUrl(e.target.value)}
								value={telegramUrl}
								autoComplete="off"
								required
							/>
						</Form.Group>
					</Col>
				</Row>
				<Row>
					<Form.Group className="mb-1">
						<Form.Label htmlFor="shortDesc">Brief Description</Form.Label>
						<Form.Control 
							type="text"
							id="name"
							onChange={(e) => setBriefDesc(e.target.value)}
							value={briefDesc}
							autoComplete="off"
							required
						/>
					</Form.Group>
				</Row>
				<Row >
					<Form.Group className="mb-1">
						<Form.Label htmlFor="fullDesc">Full Description</Form.Label>
						<Form.Control 
		    				as="textarea" 
		    				onChange={(e) => setFullDesc(e.target.value)}
		    				value={fullDesc} 
	    				/>
					</Form.Group>
				</Row>
		      	<Button variant="success" className="mt-2" as="input" type="submit" value="Create Quest" />
			</Form>
		</>
	)
}

export default CreateQuestForm