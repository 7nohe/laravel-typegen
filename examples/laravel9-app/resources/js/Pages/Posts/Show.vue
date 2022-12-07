<script setup lang="ts">
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout.vue';
import { Post } from '@/types/model';
import { Head, usePage } from '@inertiajs/inertia-vue3';

const page = usePage<{ post: Post }>()

</script>
<template>

    <Head title="Post" />

    <AuthenticatedLayout>
        <div class="py-12">
            <div class="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div class="bg-white overflow-hidden shadow-sm sm:rounded-lg p-12">
                    <h2>{{ page.props.value.post.title }}</h2>
                    <p>{{ page.props.value.post.body }}</p>
                </div>
            </div>
        </div>
    </AuthenticatedLayout>

</template>
