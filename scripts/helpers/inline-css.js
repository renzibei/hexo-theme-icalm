'use strict';


const stylus = require('stylus');
const fs = require('fs');
const pathFn = require('path');

function getProperty(obj, name) {
    name = name.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
  
    const split = name.split('.');
    let key = split.shift();
  
    if (!Object.prototype.hasOwnProperty.call(obj, key)) return '';
  
    let result = obj[key];
    const len = split.length;
  
    if (!len) return result || '';
    if (typeof result !== 'object') return '';
  
    for (let i = 0; i < len; i++) {
      key = split[i];
      if (!Object.prototype.hasOwnProperty.call(result, key)) return '';
  
      result = result[split[i]];
      if (typeof result !== 'object') return result;
    }
  
    return result;
  }
  
  function applyPlugins(stylusConfig, plugins) {
    plugins.forEach(plugin => {
      const factoryFn = require(plugin.trim());
      stylusConfig.use(factoryFn());
    });
  }

hexo.extend.helper.register('inline_css', function(path){
    const tempPath = path;
    const config = hexo.config.stylus || {};
    
    const baseDirPath = hexo.base_dir;
    const filePath = pathFn.join(baseDirPath, tempPath);
    const fileExtName = pathFn.extname(filePath);
    let fileContent = fs.readFileSync(filePath, 'utf8');
    if (fileExtName === ".css") {
        return "<style>" + fileContent + "</style>";
    }   
    else if(fileExtName === ".styl" || fileExtName === ".stylus"){
        const self = hexo;
        const plugins = ['nib'].concat(config.plugins || []);

        function defineConfig(style) {
            style.define('hexo-config', data => {
            return getProperty(self.theme.config, data.val);
            });
        }

        const stylusConfig = stylus(fileContent);
        applyPlugins(stylusConfig, plugins);

        return "<style>" + stylusConfig
            .use(defineConfig)
            .set('filename', filePath)
            .set('sourcemap', config.sourcemaps)
            .set('compress', config.compress)
            .set('include css', true)
            .render() + "</style>";
    }
});
