import Dialog from "@/components/Dialog"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"
import MyDropzone from "@/components/Dropzone"
import Link from "next/link"
import SpreadSheet from "@/components/SpreadSheet"
type ProjectViewProps = {
    params: {
        id: string
    }
}

type Field = {
    id: string
    name: string
    description: string
}


export default async function ProjectView({ params }: ProjectViewProps) {
    const authObj = await auth()
    const {id} = await params
    const url = `http://localhost:8000/projects/${id}`
    
    let sessionId
    const headers = new Headers()
    headers.append('Authorization', `Bearer ${await authObj.getToken()}`)

    if (authObj.sessionId) {
        headers.append('sessionId', authObj.sessionId)
        sessionId = authObj.sessionId
    }

    const postHeaders = new Headers();
    postHeaders.append('Authorization', `Bearer ${await authObj.getToken()}`);
    postHeaders.append('Content-Type', 'application/json')
    if (authObj.sessionId) {
        postHeaders.append('sessionId', authObj.sessionId);
    }

    const res = await fetch(url, {
        method: 'GET',
        headers: headers
    })
    const project = await res.json()
    console.log(project)

    const fieldsUrl = `http://localhost:8000/fields/${project.id}`

    const response = await fetch(fieldsUrl, {
        method: 'GET',
        headers: headers
    })

    const fields = await response.json()
    console.log(fields)


    async function addField(formData: FormData) {
        'use server'
        const name = formData.get('name')
        const res = await fetch(fieldsUrl,
            {
                method: 'POST',
                headers: postHeaders,
                body: JSON.stringify({ name })
            })

        if (!res.ok) {
            console.error("Error creating project:", await res.text());
            return;
        }

        const newField = await res.json();
        revalidatePath(`/projects/${project.id}`);
        console.log(newField);
    }

    async function onClose() {
        "use server"
        console.log("Modal has closed")
    }

    async function onOk() {
        "use server"
        console.log("Ok was clicked")
    }


    return (
        <>
            <Dialog title="Upload Your Image" onClose={onClose} onOk={onOk}>
                <form className="h-full">
                    <div className="h-full">
                    <MyDropzone sessionId = {sessionId} projectId = {id} token={await authObj.getToken()}/>
                    </div>
                </form>
            </Dialog>
            <div className="p-4">
                <div className="flex justify-between">
                    <form action={addField}>
                        <div><p>Add a field you need to extract</p></div>
                        <div className="mt-3">
                            <input type="text" name="name" className="p-3 rounded text-black border-2 border-blue-400" placeholder="Type a field name" />
                            <button type='submit' className="p-3 bg-blue-600 rounded ml-3 text-white">Add</button>
                        </div>
                    </form>
                    <div>
                        <div className="flex justify-end">
                            <p>Project: {project.name}</p>
                        </div>
                        <div className="mt-6">
                        <Link href={`/projects/${id}?modal=visible`} className="p-3 bg-blue-600 rounded ml-3 text-white">Upload your document</Link>
                        </div>
                    </div>
                </div>

                {/* {
                    fields.length >= 1 ?
                        <div>
                            {fields.map((field: Field) => (
                                <div key={field.id}>
                                    <p>{field.name}</p>
                                </div>
                            ))}
                        </div> : null
                } */}
            </div>
            <div className="p-4 flex justify-center">
                <SpreadSheet/>
            </div>
        </>
    )
}