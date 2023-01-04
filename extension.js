const vscode = require('vscode');

const COMMAND_NAME = 'create-react-native-component.createReactNativeComponent';

function utf8(str) {
    return Buffer.from(str, 'utf8');
}

async function createReactNativeComponent(basePath) {
    const componentName = await vscode.window.showInputBox({
        ignoreFocusOut: true,
        placeHolder: "ComponentName",
        validateInput: candidateName => {
            if (!candidateName[0].match(/[a-zA-Z_$]/)) {
                return "Must start with a letter";
            }

            if (candidateName.match(/ /g)) {
                return "Can't include a space";
            }

            if (!candidateName[0].match(/^[a-zA-Z_$][0-9a-zA-Z_$]*$/)) {
                return "Must be a valid js variable name";
            }
        }
    })

    console.log(basePath.toJSON());
    const joinPath = vscode.Uri.joinPath;
    const fs = vscode.workspace.fs;

    if (!componentName) return;
    const componentPath = joinPath(basePath, `/${componentName}`);
    const indexFile = joinPath(componentPath, `/index.ts`);
    const mainFile = joinPath(componentPath, `/${componentName}.tsx`);
    const cssFile = joinPath(componentPath, `/${componentName}.style.ts`);

    fs.createDirectory(componentPath);
    fs.writeFile(indexFile, utf8(
`export { default } from './${componentName}';
`
    ));

    fs.writeFile(mainFile, utf8(
`import { View, ViewProps } from 'react-native';
import styles from './${componentName}.style';

interface ${componentName}Props extends ViewProps {
  children?: React.ReactNode
};

const ${componentName} = (props: ${componentName}Props) => {
  const {children, ...rest} = props;
  return (
    <View style={styles.${componentName}} {...rest}>
      {children}
    </View>
  );
};

export default ${componentName};
`
    ));

    fs.writeFile(cssFile, utf8(
`import { StyleSheet } from 'react-native';

export default StyleSheet.create({
  ${componentName}: {

  },
});
`
    ));

    vscode.window.showInformationMessage(`Created ${componentName} in ${basePath}`);
}

function activate(context) {
    let disposable = vscode.commands.registerCommand(COMMAND_NAME, createReactNativeComponent);
    context.subscriptions.push(disposable);
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}
