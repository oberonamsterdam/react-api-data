
# Upload a file

Uploading a file is different for React and React Native. Both methods are similar.

- [React](#react)
- [React Native](#react-native)
  - [React Native TypeScript](#react-native-typescript)

## React

```js

const UploadFile = (props) => {
    const [file, setFile] = useState(undefined);
    const myUpload = useApiData('myUpload');
    const uploadFile = () => {
        let formDataToUpload = new FormData();
        formDataToUpload.append('otherPostVariable', 'value');
        formDataToUpload.append('myFile', file);
        myUpload.perform({}, formDataToUpload);
    }

    return (
        <>
            <input
                type="file"
                onChange={event => {
                    if (event.target.files && event.target.files.length > 0) {
                        setFile(event.target.files[0]);
                    }
                }}
            />
            <button onClick={uploadFile}></button>
        </>
    );
}
```

## React Native

In React Native you also need a FormData object to upload a file, however here it requires other properties: `uri`, `type` and `name`.

- `uri` url of the file, this may be a local file path, it should include the filename.
- `type` mime-type of the file.
- `name` name of the file.

```js
const MyComponent = () => {
    const fileUri = '';
    const fileContentType = '';
    const fileName = '';

    const formData = new FormData();
    formData.append('myFile', {
        uri: fileUri,
        type: fileContentType,
        name: fileName
    });

    const editArticle = useApiData('editArticle', { id: props.articleId });

    return <Button onPress={() => editArticle.perform({}, formData)} title='Upload image'>;
}
```

### React Native TypeScript

To make all TypeScript typings correct you should also create a global.d.ts in the root of your app and add this:

```ts
interface FormDataRNFile {
    uri: string;
    name: string;
    type: string;
}

interface FormData {
    append(name: string, value: FormDataRNFile, fileName?: string): void;
    set(name: string, value: FormDataRNFile, fileName?: string): void;
}
```
