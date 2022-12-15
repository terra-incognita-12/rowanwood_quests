import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom"
import Row from "react-bootstrap/Row"
import Col from "react-bootstrap/Col"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import Stack from '@mui/material/Stack';

import axios from "../../api/axios"

const LibraryList = () => {
    let [searchParams, setSearchParams] = useSearchParams();

    let tagParam  = searchParams.get("tag")

	const [allRecords, setAllRecords] = useState([])
    const [allTags, setAllTags] = useState([])
    
    const [dropDownRecords, setDropDownRecords] = useState([])
    const [pickedRecord, setPickedRecord] = useState("")
    const [inputPickedRecord, setInputPickedRecord] = useState("")

    const [dropDownTags, setDropDownTags] = useState([])
    const [pickedTag, setPickedTag] = useState("")

    const [searchRecords, setSearchRecords] = useState([]) 
    const [searchResult, setSearchResult] = useState(false)

    let listLetter = ""
    const setListLetter = (letter) => {
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
                
                let recordsData = []
                
                for (const i of response.data) {
                    recordsData.push({"name": i.name, "url": i.url})
                }

                if (isMounted) {
                    setAllRecords(response.data)
                    setDropDownRecords(recordsData)
                }
            } catch (err) {
                console.log(err)
            } 
        }

        const getTags = async () => {
            try {
                const response = await axios.get("/library/tags/all", {
                    signal: controller.signal
                })

                let searchTagsData = []
                let tagsData = []

                for (const i of response.data) {
                    tagsData.push({"name": i.name})
                }

                // If page opened with get-request tag
                if (tagParam) {
                    for (const i of response.data) {
                        if (i.name === tagParam) {
                            for (const j of i.library_records) {
                                searchTagsData.push({"name": j.name, "url": j.url})
                            }
                        }
                    }
                }

                if (isMounted) {
                    setAllTags(response.data)
                    setDropDownTags(tagsData)
                    setSearchRecords(searchTagsData)
                }
            } catch (err) {
                console.log(err)
            }
        }

        getRecords()
        getTags()

        return () => {
            isMounted = false
            controller.abort()
            if (tagParam) {
                setSearchResult(true)
            }
        }
    }, [])

    const getMatchingRecords = () => {
        let records = []
        if (pickedRecord) {
            records = allRecords.filter(elem => elem.name.toLowerCase().includes(pickedRecord.name.toLowerCase()))
            setPickedRecord("")
        } else {
            records = allRecords.filter(elem => elem.name.toLowerCase().includes(inputPickedRecord.toLowerCase()))
        }

        if (searchParams.has("tag")) {
            searchParams.delete("tag")
            setSearchParams(searchParams)
        }
        setSearchRecords(records)
        setSearchResult(true)
    }

    const getRecordsByTag = () => {
        let records = []
        for (const i of allTags) {
            if (i.name === pickedTag.name) {
                for (const j of i.library_records) {
                    records.push({"name": j.name, "url": j.url})
                }
            }
        }

        if (searchParams.has("tag")) {
            searchParams.delete("tag")
            setSearchParams(searchParams)
        }

        console.log(records)
        setSearchRecords(records)
        setSearchResult(true)
    }

    return (
        <>
            <Row className="mt-3">
                <Col xs={12} md={6}>
                    <Stack spacing={2} direction="row">
                        <Autocomplete fullWidth
                            disablePortal
                            freeSolo
                            options={dropDownRecords}
                            onChange={(e, newValue) => {
                                setPickedRecord(newValue)
                            }}
                            onInputChange={(e, newInputValue) => {
                                setInputPickedRecord(newInputValue)
                            }}
                            getOptionLabel={(option) => option.name || ""}
                            renderInput={(params) => <TextField fullWidth {...params} label="Search by Records" />}
                        />
                        <Button variant="contained" color="primary" size="large" onClick={getMatchingRecords}>Search</Button>
                    </Stack>
                </Col>
                <Col xs={12} md={6}>
                    <Stack spacing={2} direction="row">
                        <Autocomplete fullWidth
                            disablePortal
                            options={dropDownTags}
                            onChange={(e, newValue) => {
                                setPickedTag(newValue)
                            }}
                            getOptionLabel={(option) => option.name}
                            renderInput={(params) => <TextField fullWidth {...params} label="Search by Tags" />}
                        />
                        <Button variant="contained" color="primary" size="large" onClick={getRecordsByTag}>Search</Button>
                    </Stack>
                </Col>
            </Row>
            {searchResult
                ? 
                (
                    <Row>
                        <Card className="mt-3">
                            <CardContent>
                                <Typography gutterBottom variant="h5">Search Results</Typography>
                                {searchRecords.length
                                    ?
                                    searchRecords.map((record, i) =>
                                        <div>
                                            <Button component={Link} to={`${record.url}`} variant="text">{record.name}</Button>
                                        </div>  
                                    ) : <Typography gutterBottom variant="h7">No results found</Typography>
                                }
                            </CardContent>
                        </Card>   
                    </Row>
                )
                : null

            }
            <Row>
                <Card className="mt-3">
                    <CardContent>
                        <Typography gutterBottom variant="h4">All Records</Typography>
                        {allRecords.map((record, i) => 
                            <div key={i}>
                                {record.name.charAt(0) === listLetter
                                    ?
                                    <Button component={Link} to={`${record.url}`} variant="text">{record.name}</Button>
                                    :
                                    <div className="mt-4">
                                        {setListLetter(record.name.charAt(0))}
                                        <Typography gutterBottom variant="h5">{record.name.charAt(0)}</Typography>
                                        <hr/>
                                        <Button component={Link} to={`${record.url}`} variant="text" size="large">{record.name}</Button>
                                    </div>
                                }
                            </div>
                        )}
                    </CardContent>
                </Card>
            </Row>
        </>
    )
}

export default LibraryList