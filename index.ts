import './style.css';
import 'highlight.js/styles/tomorrow-night-bright.css';

import hljs from 'highlight.js';
import typescript from 'highlight.js/lib/languages/typescript';

hljs.registerLanguage('typescript', typescript);

import { ServiceGenerator } from './service-generator';
import { ReducerGenerator } from './reducer-generator';
import { Config, Schema } from './meta-models';

const courseSchema: Schema = {
  model: 'course',
  modelPlural: 'courses',
};

const lessonSchema: Schema = {
  model: 'lesson',
  modelPlural: 'lessons',
};

const assignmentSchema: Schema = {
  model: 'assignment',
  modelPlural: 'assignments',
};

const domain: Schema[] = [courseSchema, lessonSchema, assignmentSchema];

const layers = [
  { name: 'Data Layer', generator: ServiceGenerator },
  { name: 'State Layer', generator: ReducerGenerator },
];

const config: Config = {
  name: 'Workshop Config',
  application: 'dashboard',
  scope: 'acme',
};

const generateLayer = (generator, domain, config) =>
  domain.reduce((code, schema) => {
    code += `<pre><code class="language-typescript">
    ${generator.generate(schema, config).template}
    </code></pre>`;
    return code;
  }, '');

const generateStack = (layers, domain, config) =>
  layers.reduce((code, layer) => {
    code += `<h2>${layer.name}</h2>`;
    code += generateLayer(layer.generator, domain, config);
    return code;
  }, '');

const appDiv: HTMLElement = document.getElementById('app');

appDiv.innerHTML += generateStack(layers, domain, config);

hljs.highlightAll();
