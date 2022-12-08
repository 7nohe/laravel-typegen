<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Post } from '@/types/model';
import { Head, Link, usePage } from '@inertiajs/inertia-vue3';

const page = usePage<{ posts: Post[] }>()

</script>
<template>

    <Head title="Posts" />

    <AuthenticatedLayout>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                    <div v-for="post in page.props.value.posts">
                        <Link :href="route('posts.show', { post: String(post.id) })" class="underline hover:text-blue-500">{{ post.title }}</Link>
                    </div>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>

</template>
