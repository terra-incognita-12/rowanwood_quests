import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"
import Button from "react-bootstrap/Button"
import Container from "react-bootstrap/Container";

import axios from "../../api/axios"

const LibraryList = () => {
	const [records, setRecords] = useState("")
    let listLetter = ""

    function setListLetter(letter) {
        listLetter = letter
    }

	useEffect(() => {
        let isMounted = true
        const controller = new AbortController()

        const getRecords = async () => {
            
            try {
                const response = await axios.get("/library/records/all", {
                    signal: controller.signal
                })
                isMounted && setRecords(response.data)
            } catch (err) {
                console.log(err)
            } 
        }

        getRecords()

        return () => {
            isMounted = false
            controller.abort()
        }
    }, [])

    return (
        <Container>
            {records?.length
                ?
                records.map((record, i) => 
                    <div key={i}>
                        {record.name.charAt(0) === listLetter
                            ?
                            <Link to={`${record.url}`} className="text-decoration-none">
                                <h3>{record.name}</h3>
                            </Link>
                            :
                            <div className="mt-4">
                                {setListLetter(record.name.charAt(0))}
                                <h1>{record.name.charAt(0)}</h1>
                                <hr/>
                                <Link to={`${record.url}`} className="text-decoration-none">
                                    <h3>{record.name}</h3>
                                </Link>
                            </div>
                        }
                    </div>
                ) : null
            }
        </Container>
    )
}

export default LibraryList