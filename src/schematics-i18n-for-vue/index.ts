import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export function schematicsI18nForVue(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    let [type,key] = _options.key.split('.');
    if(!type){
      return
    }
    let option = _options;
    let optionKey=Object.keys(option)
    optionKey.shift()
    optionKey.forEach(lang=>{
      let langUrl=`./src/assets/lang/${lang}.js`
      const checkHasType = tsquery.query<ts.ObjectLiteralExpression>(tree.read(langUrl)!.toString(),`ObjectLiteralExpression> PropertyAssignment[name.name=${type}]`).pop()
      
      if(checkHasType){
        const getFinalProperty = tsquery.query<ts.ObjectLiteralExpression>(tree.read(langUrl)!.toString(),`PropertyAssignment[name.name=${type}]>ObjectLiteralExpression>PropertyAssignment`).pop()!
        const mainJsRecorder = tree.beginUpdate(langUrl);
        mainJsRecorder.insertLeft(getFinalProperty.end, `,\n\t\t\t${key}:"${option[lang]}"`);
        tree.commitUpdate(mainJsRecorder);
        return
      }
      const mainJsRecorder = tree.beginUpdate(langUrl);
      const getFinalObjectLiteral = tsquery.query<ts.ObjectLiteralExpression>(tree.read(langUrl)!.toString(),'ObjectLiteralExpression > PropertyAssignment').pop()!
      if(type && key){
        mainJsRecorder.insertLeft(getFinalObjectLiteral.end, `,\n\t\t${type}:{\n\t\t\t${key}:"${option[lang]}"\n\t\t}`);
      }else{
        mainJsRecorder.insertLeft(getFinalObjectLiteral.end, `,\n\t\t${type}:"${option[lang]}"`);
      }
        
      tree.commitUpdate(mainJsRecorder);
    })
    return tree;
  };
}
