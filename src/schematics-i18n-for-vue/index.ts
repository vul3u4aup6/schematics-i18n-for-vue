import { Rule, SchematicContext, Tree } from '@angular-devkit/schematics';
import { tsquery } from '@phenomnomnominal/tsquery';
import * as ts from 'typescript';

export function schematicsI18nForVue(_options: any): Rule {
  return (tree: Tree, _context: SchematicContext) => {
    let [type, key] = _options.key.split('.');
    if(!type){
      return
    }
    let { tw } = _options;
    const checkHasType = tsquery.query<ts.ObjectLiteralExpression>(tree.read('./src/lang/i18n/tw.js')!.toString(),`PropertyAssignment[name.name=${type}]`).pop()
    if(checkHasType){
      const getFinalProperty = tsquery.query<ts.ObjectLiteralExpression>(tree.read('./src/lang/i18n/tw.js')!.toString(),`PropertyAssignment[name.name=${type}]>ObjectLiteralExpression>PropertyAssignment`).pop()!
      const mainJsRecorder = tree.beginUpdate('./src/lang/i18n/tw.js');
      mainJsRecorder.insertLeft(getFinalProperty.end, `,\n\t\t${key}:"${tw}"`);
      tree.commitUpdate(mainJsRecorder);
      return
    }
    const getFinalObjectLiteral = tsquery.query<ts.ObjectLiteralExpression>(tree.read('./src/lang/i18n/tw.js')!.toString(),'ObjectLiteralExpression').pop()!
    const mainJsRecorder = tree.beginUpdate('./src/lang/i18n/tw.js');
    if(type && key){
      mainJsRecorder.insertLeft(getFinalObjectLiteral.end, `,\n\t${type}:{\n\t\t${key}:"${tw}"\n\t}`);
    }else{
      mainJsRecorder.insertLeft(getFinalObjectLiteral.end, `,\n\t${type}:"${tw}"`);
    }
    tree.commitUpdate(mainJsRecorder);
    return tree;
  };
}
