import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Card from "react-bootstrap/Card"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import moment from 'moment'

import axios from "../../api/axios"

const LibraryInfo = ({ url }) => {

	const [record, setRecord] = useState("")

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getRecord = async () => {
            
            try {
                const response = await axios.get(`/library/records/${url}`, {
                    signal: controller.signal
                })
                isMounted && setRecord(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getRecord()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

	return (
		<>
			<div className="text-center mt-5">
				<h1>{record?.name}</h1>
			</div>
			<div className="mt-3">
				<p>{record?.description}</p>
			</div>
			<Link to="/" className="text-decoration-none">#{record?.url}</Link>
		</>
	)

}

export default LibraryInfo