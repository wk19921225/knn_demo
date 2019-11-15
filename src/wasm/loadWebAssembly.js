export const getExportFunction = async (url) => {
    const env = {
        __memory_base: 0,
        __table_base: 0,
        memory: new WebAssembly.Memory({
            initial: 256,
            maximum: 256,
        }),
        table: new WebAssembly.Table({
            initial: 10,
            maximum: 10,
            element: 'anyfunc'
        }),
        abortStackOverflow: new Function(),
        nullFunc_ii: new Function(),
        nullFunc_iiii: new Function(),
        nullFunc_iidiiii: new Function(),
        nullFunc_jiji: new Function(),
        nullFunc_vii: new Function(),
        ___lock: new Function(),
        ___unlock: new Function(),
        ___wasi_fd_write: new Function(),
        _emscripten_get_heap_size: new Function(),
        _emscripten_memcpy_big: new Function(),
        _emscripten_resize_heap: new Function(),
        setTempRet0: new Function(),
        tempDoublePtr: 0,
    };
    const instance = await fetch(url).then((response) => {
        return response.arrayBuffer();
    })
        .then((bytes) => {
        return WebAssembly.instantiate(bytes, {env: env})
    })
        .then(instance => instance.instance.exports)
    return instance;
};
