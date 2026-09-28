import path from 'path';
import { defineConfig } from 'vite';

const viteConfig = defineConfig(async () => {
    const mdx = await import('@mdx-js/rollup');
    const remarkFrontmatter = await import('remark-frontmatter');
    const remarkMdxFrontmatter = await import('remark-mdx-frontmatter');
    const remarkMdxImages = await import('remark-mdx-images');

    return {
        plugins: [
            mdx.default({
                providerImportSource: '@mdx-js/react',
                mdExtensions: [],
                mdxExtensions: ['.mdx', '.md'],
                remarkPlugins: [
                    remarkFrontmatter.default,
                    remarkMdxFrontmatter.default,
                    remarkMdxImages.default,
                ],
            }),
        ],
        server: {
            fs: {
                allow: [path.resolve(__dirname, '../..')],
            },
            // Dev-only: forward chap route sub-paths directly to chap-core,
            // bypassing DHIS2 2.41's lack of sub-path route support.
            proxy: {
                '/api/routes/chap/run': {
                    target: 'http://localhost:8000',
                    rewrite: (path) => path.replace(/^\/api\/routes\/chap\/run/, ''),
                    changeOrigin: true,
                },
            },
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, 'src'),
                '@docs': path.resolve(__dirname, 'docs'),
                '@dhis2-chap/ui': path.resolve(__dirname, '../../packages/ui/src'),
            },
        },
        clearScreen: true,
    };
});

export default viteConfig;
