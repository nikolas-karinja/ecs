import dts from "rollup-plugin-dts"
import { nodeResolve } from '@rollup/plugin-node-resolve'
// import { terser } from 'rollup-plugin-terser'

const config = [
    {
        input: 'lib/index.js',
        output: [
            {
                file: 'build/index.mjs',
                format: 'es'
            },
            {
                file: 'build/index.cjs',
                format: 'cjs'
            }
        ],
        plugins: [ nodeResolve() ],
        external: [ 
            'uuid', 
            'three',
            'three/examples/jsm/loaders/GLTFLoader',
            'three/examples/jsm/utils/SkeletonUtils.js',
        ]
    },
    {
        input: "lib/index.d.ts",
        output: [ 
            { 
                file: "build/index.d.ts", 
                format: "es" 
            }
        ],
        plugins: [ dts() ],
    },
]

export default config