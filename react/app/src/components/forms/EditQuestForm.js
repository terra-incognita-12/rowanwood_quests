import { useLocation, useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import ErrMsg from "../ErrMsg"
import axios from "../../api/axios"
import useAxiosPrivate from "../../hooks/useAxiosPrivate"
import useRedirectLogin from "../../hooks/useRedirectLogin"

const URL_REGEX = /^[a-z][a-z0-9-_]{3,23}$/

const EditQuestForm = ({ quest }) => {
	const navigate = useNavigate()
	const location = useLocation()
	const axiosPrivate = useAxiosPrivate()  
    const redirectLogin = useRedirectLogin(location)

    const questId = quest?.id
    const questName = quest?.name
    const questBriefDesc = quest?.brief_description
    const questFullDesc = quest?.full_description
    const questUrl = quest?.url
    const questTelegramUrl = quest?.telegram_url
    const questPhoto = quest?.photo

	const [name, setName] = useState("")
	const [briefDesc, setBriefDesc] = useState("")
	const [fullDesc, setFullDesc] = useState("")
	const [url, setUrl] = useState("")
	const [telegramUrl, setTelegramUrl] = useState("")
	const [photo, setPhoto] = useState("")

	const [errMsg, setErrMsg] = useState("")
	const [showErrMsg, setShowErrMsg] = useState(false)

	useEffect(() => {
		setName(questName)
		setBriefDesc(questBriefDesc)
		setFullDesc(questFullDesc)
		setUrl(questUrl)
		setTelegramUrl(questTelegramUrl)
		setPhoto(questPhoto)
	}, [questName, questBriefDesc, questFullDesc, questUrl, questTelegramUrl, questPhoto])


	const handleShowErr = (e) => {
		setShowErrMsg(e)
	}

	const handleSubmit = async (e) => {
		e.preventDefault()
		
		if (!URL_REGEX.test(url)) {
			setErrMsg("Invaid quest url. Must start with the lower case letter and after must followed by 3 to 23 char that can be lowercase, number, - and _")
			handleShowErr(true)
			return
		}

		try {
			const response = await axiosPrivate.patch(`/quest/update/${questId}`, JSON.stringify({"name": name, "url": url, "telegram_url": telegramUrl, "brief_description": briefDesc, "full_description": fullDesc, "photo": photo}))

			navigate(`/quest/${response.data.url}`, { replace: true })
		} catch (err) {
			if (!err?.response) {
				setErrMsg("No server respone")
			} else if (err.response?.status === 400) {
				redirectLogin()
			} else if (err.response?.status === 403) {
				setErrMsg("Quest with this url already exists")
			} else if (err.response?.status === 404) {
				setErrMsg("Quest doesn't exist")
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
								value={name || ""}
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
								value={photo || ""}
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
								value={url || ""}
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
								value={telegramUrl || ""}
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
							value={briefDesc || ""}
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
		    				value={fullDesc || ""} 
	    				/>
					</Form.Group>
				</Row>
		      	<Button variant="success" className="mt-2" as="input" type="submit" value="Update Quest" />
			</Form>
		</>
	)
}

export default EditQuestForm